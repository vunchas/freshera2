<?php
if (!defined('ABSPATH')) exit;

// ============================================
// THEME SETUP
// ============================================

function oru_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
}
add_action('after_setup_theme', 'oru_theme_setup');

// ============================================
// ENQUEUE REACT APP
// ============================================

function oru_enqueue_react_app() {
    $theme_uri = get_template_directory_uri();
    $theme_path = get_template_directory();
    
    if (file_exists($theme_path . '/dist/static/css/main.css')) {
        wp_enqueue_style(
            'oru-styles',
            $theme_uri . '/dist/static/css/main.css',
            array(),
            filemtime($theme_path . '/dist/static/css/main.css')
        );
    }
    
    if (file_exists($theme_path . '/dist/static/js/main.js')) {
        wp_enqueue_script(
            'oru-react-app',
            $theme_uri . '/dist/static/js/main.js',
            array(),
            filemtime($theme_path . '/dist/static/js/main.js'),
            true
        );
        
        wp_localize_script('oru-react-app', 'oruData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('oru_nonce'),
            'siteUrl' => get_site_url(),
            'restUrl' => rest_url(),
            'restNonce' => wp_create_nonce('wp_rest'),
            'wcApiUrl' => rest_url('wc/v3/'),
            'currency' => get_woocommerce_currency(),
            'currencySymbol' => get_woocommerce_currency_symbol(),
            'montonioAccessKey' => get_option('oru_montonio_access_key', ''),
            'montonioEnvironment' => get_option('oru_montonio_environment', 'sandbox'),
        ));
    }
}
add_action('wp_enqueue_scripts', 'oru_enqueue_react_app');

add_filter('script_loader_tag', function($tag, $handle) {
    if ($handle === 'oru-react-app') {
        return str_replace('<script ', '<script type="module" ', $tag);
    }
    return $tag;
}, 10, 2);

// ============================================
// WOOCOMMERCE API CONFIGURATION
// ============================================

add_filter('woocommerce_rest_check_permissions', function($permission, $context, $object_id, $post_type) {
    if ($context === 'read' && $post_type === 'product') {
        return true;
    }
    return $permission;
}, 10, 4);

add_filter('woocommerce_rest_check_permissions', function($permission, $context, $object_id, $post_type) {
    $route = $_SERVER['REQUEST_URI'] ?? '';
    
    if (strpos($route, '/wc/v3/shipping') !== false && $_SERVER['REQUEST_METHOD'] === 'GET') {
        return true;
    }
    
    return $permission;
}, 20, 4);

add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WC-Webhook-Source');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit;
        }
        
        return $value;
    });
}, 15);

add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    $data = $response->get_data();
    
    $data['sweetness'] = get_post_meta($product->get_id(), 'sweetness', true) ?: '2';
    $data['throat_hit'] = get_post_meta($product->get_id(), 'throat_hit', true) ?: '2';
    
    $colors_meta = get_post_meta($product->get_id(), 'device_colors', true);
    if ($colors_meta) {
        $data['device_colors'] = json_decode($colors_meta, true);
    }
    
    $response->set_data($data);
    return $response;
}, 10, 3);

// ============================================
// CUSTOM REST API ENDPOINTS
// ============================================

add_action('rest_api_init', function() {
    register_rest_route('oru/v1', '/orders', array(
        'methods' => 'POST',
        'callback' => 'oru_create_order',
        'permission_callback' => '__return_true',
    ));
    
    register_rest_route('oru/v1', '/subscriptions', array(
        'methods' => 'POST',
        'callback' => 'oru_create_subscription',
        'permission_callback' => '__return_true',
    ));
    
    register_rest_route('oru/v1', '/montonio-webhook', array(
        'methods' => 'POST',
        'callback' => 'oru_montonio_webhook',
        'permission_callback' => '__return_true',
    ));
    
    register_rest_route('oru/v1', '/payment-status/(?P<order_id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'oru_get_payment_status',
        'permission_callback' => '__return_true',
    ));
    
    register_rest_route('oru/v1', '/pickup-points/(?P<provider>[a-z]+)', array(
        'methods' => 'GET',
        'callback' => 'oru_get_pickup_points',
        'permission_callback' => '__return_true',
    ));
    
    // NEW: Shipping methods endpoint
    register_rest_route('oru/v1', '/shipping-methods', array(
        'methods' => 'GET',
        'callback' => 'oru_get_shipping_methods',
        'permission_callback' => '__return_true',
    ));
});

// ============================================
// PICKUP POINTS ENDPOINT
// ============================================

function oru_get_shipping_methods($request) {
    try {
        $shipping_methods = array();
        
        // Get all shipping zones
        $zones = WC_Shipping_Zones::get_zones();
        
        // Add methods from each zone
        foreach ($zones as $zone) {
            $zone_obj = new WC_Shipping_Zone($zone['id']);
            $methods = $zone_obj->get_shipping_methods(true); // true = enabled only
            
            foreach ($methods as $method) {
                $method_id = $method->id;
                $instance_id = $method->get_instance_id();
                
                // Get method title
                $title = $method->get_title();
                
                // Get cost if available
                $cost = 0;
                if (method_exists($method, 'get_option')) {
                    $cost_setting = $method->get_option('cost');
                    if ($cost_setting && is_numeric($cost_setting)) {
                        $cost = floatval($cost_setting);
                    }
                }
                
                // Detect provider and whether it's pickup or courier
                $is_pickup = false;
                $provider = null;
                
                $title_lower = strtolower($title);
                $method_id_lower = strtolower($method_id);
                
                // Detect Montonio plugin shipping methods
                if (strpos($method_id_lower, 'montonio_omniva') !== false || strpos($title_lower, 'omniva') !== false) {
                    $provider = 'omniva';
                    // Check if it's pickup or courier
                    if (strpos($method_id_lower, 'parcel') !== false || 
                        strpos($title_lower, 'paštomatu') !== false || 
                        strpos($title_lower, 'paštomat') !== false) {
                        $is_pickup = true;
                    } else {
                        $is_pickup = false; // Courier
                    }
                }
                elseif (strpos($method_id_lower, 'montonio_unisend') !== false || strpos($title_lower, 'unisend') !== false) {
                    $provider = 'unisend';
                    $is_pickup = true; // Unisend is only pickup
                }
                elseif (strpos($method_id_lower, 'montonio_dpd') !== false || strpos($title_lower, 'dpd') !== false) {
                    $provider = 'dpd';
                    if (strpos($method_id_lower, 'parcel') !== false || 
                        strpos($title_lower, 'paštomatu') !== false) {
                        $is_pickup = true;
                    }
                }
                elseif (strpos($method_id_lower, 'montonio_venipak') !== false || strpos($title_lower, 'venipak') !== false) {
                    $provider = 'venipak';
                    if (strpos($method_id_lower, 'parcel') !== false || 
                        strpos($title_lower, 'paštomatu') !== false) {
                        $is_pickup = true;
                    }
                }
                elseif (strpos($title_lower, 'smartpost') !== false) {
                    $is_pickup = true;
                    $provider = 'smartpost';
                } 
                elseif (strpos($title_lower, 'inpost') !== false) {
                    $is_pickup = true;
                    $provider = 'inpost';
                }
                
                $shipping_methods[] = array(
                    'id' => $method_id . ':' . $instance_id,
                    'method_id' => $method_id,
                    'instance_id' => $instance_id,
                    'title' => $title,
                    'cost' => $cost,
                    'description' => $method->get_method_description(),
                    'is_pickup' => $is_pickup,
                    'provider' => $provider,
                );
            }
        }
        
        // Also check "Rest of the World" zone
        $zone = new WC_Shipping_Zone(0); // 0 = locations not covered by other zones
        $methods = $zone->get_shipping_methods(true);
        
        foreach ($methods as $method) {
            $method_id = $method->id;
            $instance_id = $method->get_instance_id();
            
            $title = $method->get_title();
            $cost = 0;
            if (method_exists($method, 'get_option')) {
                $cost_setting = $method->get_option('cost');
                if ($cost_setting && is_numeric($cost_setting)) {
                    $cost = floatval($cost_setting);
                }
            }
            
            // Detect provider and whether it's pickup or courier
            $is_pickup = false;
            $provider = null;
            
            $title_lower = strtolower($title);
            $method_id_lower = strtolower($method_id);
            
            // Detect Montonio plugin shipping methods
            if (strpos($method_id_lower, 'montonio_omniva') !== false || strpos($title_lower, 'omniva') !== false) {
                $provider = 'omniva';
                if (strpos($method_id_lower, 'parcel') !== false || 
                    strpos($title_lower, 'paštomatu') !== false || 
                    strpos($title_lower, 'paštomat') !== false) {
                    $is_pickup = true;
                } else {
                    $is_pickup = false;
                }
            }
            elseif (strpos($method_id_lower, 'montonio_unisend') !== false || strpos($title_lower, 'unisend') !== false) {
                $provider = 'unisend';
                $is_pickup = true;
            }
            elseif (strpos($method_id_lower, 'montonio_dpd') !== false || strpos($title_lower, 'dpd') !== false) {
                $provider = 'dpd';
                if (strpos($method_id_lower, 'parcel') !== false || 
                    strpos($title_lower, 'paštomatu') !== false) {
                    $is_pickup = true;
                }
            }
            elseif (strpos($method_id_lower, 'montonio_venipak') !== false || strpos($title_lower, 'venipak') !== false) {
                $provider = 'venipak';
                if (strpos($method_id_lower, 'parcel') !== false || 
                    strpos($title_lower, 'paštomatu') !== false) {
                    $is_pickup = true;
                }
            }
            
            $shipping_methods[] = array(
                'id' => $method_id . ':' . $instance_id,
                'method_id' => $method_id,
                'instance_id' => $instance_id,
                'title' => $title,
                'cost' => $cost,
                'description' => $method->get_method_description(),
                'is_pickup' => $is_pickup,
                'provider' => $provider,
            );
        }
        
        error_log('ORU: Returning ' . count($shipping_methods) . ' shipping methods');
        
        return new WP_REST_Response($shipping_methods, 200);
        
    } catch (Exception $e) {
        error_log('ORU: Error getting shipping methods: ' . $e->getMessage());
        return new WP_REST_Response(array('error' => $e->getMessage()), 500);
    }
}

function oru_get_pickup_points($request) {
    $provider = $request['provider'];
    
    error_log('ORU: Fetching pickup points for provider: ' . $provider);
    
    global $wpdb;
    
    // METHOD 1: Get from Montonio plugin's transient cache (legacy SelectWoo)
    $transient_key = 'montonio_' . $provider . '_pickup_points';
    $cached_points = get_transient($transient_key);
    
    if ($cached_points && is_array($cached_points)) {
        error_log('ORU: Found ' . count($cached_points) . ' pickup points in transient: ' . $transient_key);
        return new WP_REST_Response($cached_points, 200);
    }
    
    // METHOD 2: Get from shipping method instance settings
    $pattern = "woocommerce_montonio_{$provider}%";
    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE %s",
        $pattern
    ));
    
    error_log('ORU: Searching shipping settings, found ' . count($results) . ' options');
    
    foreach ($results as $row) {
        $settings = maybe_unserialize($row->option_value);
        
        if (is_array($settings)) {
            // Try different field names
            $possible_fields = array(
                'pickup_points',
                'terminals',
                'locations',
                'parcel_terminals',
                'stores',
            );
            
            foreach ($possible_fields as $field) {
                if (isset($settings[$field])) {
                    $points = $settings[$field];
                    
                    // Decode if JSON
                    if (is_string($points)) {
                        $decoded = json_decode($points, true);
                        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                            $points = $decoded;
                        }
                    }
                    
                    if (is_array($points) && count($points) > 0) {
                        error_log('ORU: Found ' . count($points) . ' pickup points in ' . $row->option_name . ' field: ' . $field);
                        
                        // Format points properly
                        $formatted = array();
                        foreach ($points as $point) {
                            if (is_array($point)) {
                                $formatted[] = array(
                                    'uuid' => isset($point['uuid']) ? $point['uuid'] : (isset($point['id']) ? $point['id'] : uniqid()),
                                    'name' => isset($point['name']) ? $point['name'] : '',
                                    'address' => isset($point['address']) ? $point['address'] : '',
                                    'city' => isset($point['city']) ? $point['city'] : (isset($point['locality']) ? $point['locality'] : ''),
                                    'country' => isset($point['country']) ? $point['country'] : 'LT',
                                    'postalCode' => isset($point['postalCode']) ? $point['postalCode'] : (isset($point['postal_code']) ? $point['postal_code'] : ''),
                                );
                            }
                        }
                        
                        if (count($formatted) > 0) {
                            return new WP_REST_Response($formatted, 200);
                        }
                    }
                }
            }
        }
    }
    
    // METHOD 3: Fetch from Montonio API directly
    error_log('ORU: No cached points found, fetching from Montonio API...');
    
    // Get credentials
    $settings = get_option('woocommerce_montonio_payments_settings', array());
    $access_key = isset($settings['access_key']) ? $settings['access_key'] : '';
    $environment = isset($settings['environment']) ? $settings['environment'] : 'sandbox';
    
    if (!empty($access_key)) {
        $api_url = $environment === 'production'
            ? 'https://stargate.montonio.com/api/stores/pickup-points'
            : 'https://sandbox-stargate.montonio.com/api/stores/pickup-points';
        
        // Provider mapping
        $provider_map = array(
            'omniva' => 'omniva',
            'unisend' => 'unisend',
            'dpd' => 'dpd_lithuania',
            'venipak' => 'venipak',
        );
        
        $api_provider = isset($provider_map[$provider]) ? $provider_map[$provider] : $provider;
        
        $url = $api_url . '?provider=' . $api_provider . '&country=LT';
        error_log('ORU: Fetching from: ' . $url);
        
        $response = wp_remote_get($url, array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $access_key,
            ),
            'timeout' => 15,
        ));
        
        if (!is_wp_error($response)) {
            $code = wp_remote_retrieve_response_code($response);
            $body = json_decode(wp_remote_retrieve_body($response), true);
            
            if ($code === 200 && is_array($body) && count($body) > 0) {
                error_log('ORU: Got ' . count($body) . ' points from Montonio API');
                
                // Cache for 1 hour
                set_transient($transient_key, $body, HOUR_IN_SECONDS);
                
                return new WP_REST_Response($body, 200);
            }
        }
    }
    
    error_log('ORU: No pickup points found for: ' . $provider);
    return new WP_REST_Response(array(), 200);
}

// ============================================
// ORDER CREATION FUNCTION
// ============================================

function oru_create_order($request) {
    try {
        $params = $request->get_json_params();
        
        error_log('ORU Order Creation Request: ' . print_r($params, true));
        
        if (empty($params['billing'])) {
            return new WP_Error('missing_billing', 'Missing billing information', array('status' => 400));
        }
        
        if (empty($params['line_items'])) {
            return new WP_Error('missing_items', 'No products in order', array('status' => 400));
        }
        
        $order = wc_create_order();
        
        if (!$order) {
            throw new Exception('Failed to create WooCommerce order object');
        }
        
        $items_added = 0;
        foreach ($params['line_items'] as $line_item) {
            $product_id = isset($line_item['product_id']) ? intval($line_item['product_id']) : 0;
            $quantity = isset($line_item['quantity']) ? intval($line_item['quantity']) : 1;
            
            if ($product_id <= 0) {
                error_log('Invalid product ID: ' . $product_id);
                continue;
            }
            
            $product = wc_get_product($product_id);
            if (!$product) {
                error_log('Product not found: ' . $product_id);
                continue;
            }
            
            $item_id = $order->add_product($product, $quantity);
            
            if ($item_id && !empty($line_item['meta_data'])) {
                foreach ($line_item['meta_data'] as $meta) {
                    if (!empty($meta['key']) && !empty($meta['value'])) {
                        wc_add_order_item_meta($item_id, $meta['key'], $meta['value']);
                    }
                }
            }
            
            $items_added++;
        }
        
        if ($items_added === 0) {
            $order->delete(true);
            throw new Exception('No valid products were added to the order');
        }
        
        $order->set_address($params['billing'], 'billing');
        
        if (!empty($params['shipping'])) {
            $order->set_address($params['shipping'], 'shipping');
        } else {
            $order->set_address($params['billing'], 'shipping');
        }
        
        if (!empty($params['shipping_lines'])) {
            foreach ($params['shipping_lines'] as $shipping) {
                $shipping_item = new WC_Order_Item_Shipping();
                $shipping_item->set_method_title($shipping['method_title']);
                $shipping_item->set_method_id($shipping['method_id']);
                $shipping_item->set_total(floatval($shipping['total']));
                
                if (!empty($shipping['meta_data'])) {
                    foreach ($shipping['meta_data'] as $meta) {
                        if (!empty($meta['key']) && !empty($meta['value'])) {
                            $shipping_item->add_meta_data($meta['key'], $meta['value'], true);
                            $order->add_meta_data($meta['key'], $meta['value']);
                        }
                    }
                }
                
                $order->add_item($shipping_item);
            }
        }
        
        $payment_method = !empty($params['payment_method']) ? $params['payment_method'] : 'montonio';
        $payment_title = !empty($params['payment_method_title']) ? $params['payment_method_title'] : 'Montonio Payments';
        
        $order->set_payment_method($payment_method);
        $order->set_payment_method_title($payment_title);
        
        // Store the selected payment option for Montonio
        // This tells Montonio which specific bank/card was selected
        if (!empty($params['payment_method_title'])) {
            $order->update_meta_data('_montonio_payment_method_name', $params['payment_method_title']);
            
            // Map payment method names to Montonio preselection codes
            $preselection_map = array(
                'SEB' => 'LITAS',
                'Swedbank' => 'HABA',
                'Luminor' => 'NDEALT21',
                'Šiaulių bankas' => 'CBVI',
                'Medicinos bankas' => 'MDBALT22',
                'Revolut' => 'REVOLT21',
                'Citadele' => 'INDULT2X',
                'Apple Pay' => 'applepay',
                'Google Pay' => 'googlepay',
            );
            
            // Check if the title matches any of the preselection codes
            foreach ($preselection_map as $name => $code) {
                if (stripos($payment_title, $name) !== false) {
                    $order->update_meta_data('_montonio_preselected_payment_method', $code);
                    error_log('ORU: Set Montonio preselection to: ' . $code . ' for payment: ' . $payment_title);
                    break;
                }
            }
        }
        
        if (!empty($params['customer_note'])) {
            $order->set_customer_note($params['customer_note']);
        }
        
        $order->calculate_totals();
        
        if (!empty($params['is_subscription']) && $params['is_subscription']) {
            $subtotal = $order->get_subtotal();
            $discount_amount = $subtotal * 0.30;
            
            $fee = new WC_Order_Item_Fee();
            $fee->set_name('Prenumeratos nuolaida (30%)');
            $fee->set_amount(-$discount_amount);
            $fee->set_total(-$discount_amount);
            $order->add_item($fee);
            
            $order->add_meta_data('_is_subscription', 'yes');
            $order->add_meta_data('_subscription_interval', 'month');
            $order->add_meta_data('_subscription_discount', $discount_amount);
            
            $order->calculate_totals();
        }
        
        $order->set_status('pending', 'Order created via ORU checkout');
        $order->save();
        
        error_log('Order created successfully: ' . $order->get_id());
        
        $montonio_data = oru_create_montonio_payment($order, $payment_title);
        
        if (is_wp_error($montonio_data)) {
            $order->add_order_note('Payment gateway error: ' . $montonio_data->get_error_message());
            $order->save();
            
            error_log('ORU: ❌ MONTONIO ERROR: ' . $montonio_data->get_error_message());
            
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Order created but payment initialization failed: ' . $montonio_data->get_error_message(),
                'order_id' => $order->get_id(),
                'debug' => array(
                    'error' => $montonio_data->get_error_message(),
                    'error_code' => $montonio_data->get_error_code(),
                    'payment_method' => $payment_title,
                    'check' => 'See browser console and wp-content/debug.log for details',
                ),
                '_console' => array(
                    'type' => 'error',
                    'messages' => array(
                        '❌ MONTONIO PAYMENT FAILED',
                        'Error: ' . $montonio_data->get_error_message(),
                        'Error Code: ' . $montonio_data->get_error_code(),
                        'Payment Method: ' . $payment_title,
                        'Order ID: ' . $order->get_id(),
                        '💡 Fix: Check WooCommerce → Settings → Payments → Montonio configuration',
                    ),
                ),
            ), 500);
        }
        
        $order->add_meta_data('_montonio_uuid', $montonio_data['uuid']);
        $order->add_order_note('Montonio payment initiated. UUID: ' . $montonio_data['uuid']);
        $order->save();
        
        error_log('ORU: ✅ SUCCESS! Montonio payment created for order: ' . $order->get_id());
        error_log('ORU: Payment URL: ' . $montonio_data['payment_url']);
        
        return new WP_REST_Response(array(
            'success' => true,
            'order_id' => $order->get_id(),
            'order_key' => $order->get_order_key(),
            'payment_url' => $montonio_data['payment_url'],
            'total' => $order->get_total(),
            'items_count' => $items_added,
            'status' => $order->get_status(),
            'debug' => array(
                'montonio_uuid' => $montonio_data['uuid'],
                'payment_method' => $payment_title,
                'message' => 'Order created successfully! Redirecting to Montonio...',
            ),
            '_console' => array(
                'type' => 'success',
                'messages' => array(
                    '✅ ORDER CREATED SUCCESSFULLY!',
                    'Order ID: ' . $order->get_id(),
                    'Payment Method: ' . $payment_title,
                    'Montonio UUID: ' . $montonio_data['uuid'],
                    'Total: €' . $order->get_total(),
                    '🚀 Redirecting to Montonio payment gateway...',
                    'Payment URL: ' . $montonio_data['payment_url'],
                ),
            ),
        ), 200);
        
    } catch (Exception $e) {
        error_log('ORU Order Creation Error: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        
        return new WP_REST_Response(array(
            'success' => false,
            'message' => $e->getMessage(),
            'error' => $e->getMessage(),
        ), 500);
    }
}

// ============================================
// SUBSCRIPTION CREATION FUNCTION
// ============================================

function oru_create_subscription($request) {
    if (!class_exists('WC_Subscriptions')) {
        return oru_create_order($request);
    }
    
    try {
        $params = $request->get_json_params();
        $params['is_subscription'] = true;
        
        $request->set_body(json_encode($params));
        return oru_create_order($request);
        
    } catch (Exception $e) {
        return new WP_Error('subscription_error', $e->getMessage(), array('status' => 500));
    }
}

// ============================================
// MONTONIO PAYMENT INTEGRATION - DIRECT API
// ============================================

function oru_create_montonio_payment($order, $payment_method_title = 'Montonio Payments') {
    error_log('========================================');
    error_log('🔵 MONTONIO PAYMENT PROCESSING START');
    error_log('Order ID: ' . $order->get_id());
    error_log('Payment Method: ' . $payment_method_title);
    error_log('========================================');
    
    // Try to get credentials from WooCommerce payment gateway settings
    $access_key = '';
    $secret_key = '';
    $environment = 'sandbox';
    
    // Method 1: Direct from gateway instances (most reliable)
    $payment_gateways = WC()->payment_gateways();
    if ($payment_gateways) {
        $gateways = $payment_gateways->payment_gateways();
        
        error_log('ORU: Checking ' . count($gateways) . ' payment gateways for Montonio');
        
        // Look for ANY Montonio gateway
        foreach ($gateways as $gateway_id => $gateway) {
            if (stripos($gateway_id, 'montonio') !== false) {
                error_log('ORU: Found gateway ID: ' . $gateway_id . ' (enabled: ' . $gateway->enabled . ')');
                
                // Check if settings exist
                if (isset($gateway->settings) && is_array($gateway->settings)) {
                    error_log('ORU: Gateway has settings array');
                    
                    // Try different key names
                    $key_variations = array('access_key', 'accessKey', 'api_key', 'apiKey');
                    $secret_variations = array('secret_key', 'secretKey', 'api_secret', 'apiSecret');
                    
                    foreach ($key_variations as $key_name) {
                        if (!empty($gateway->settings[$key_name])) {
                            $access_key = $gateway->settings[$key_name];
                            error_log('ORU: Found access_key as: ' . $key_name);
                            break;
                        }
                    }
                    
                    foreach ($secret_variations as $secret_name) {
                        if (!empty($gateway->settings[$secret_name])) {
                            $secret_key = $gateway->settings[$secret_name];
                            error_log('ORU: Found secret_key as: ' . $secret_name);
                            break;
                        }
                    }
                    
                    if (!empty($gateway->settings['environment'])) {
                        $environment = $gateway->settings['environment'];
                    }
                    
                    if (!empty($access_key)) {
                        error_log('ORU: Got credentials from gateway: ' . $gateway_id);
                        error_log('ORU: Access Key: ' . substr($access_key, 0, 20) . '...');
                        error_log('ORU: Environment: ' . $environment);
                        break;
                    }
                }
            }
        }
    }
    
    // Method 2: Direct option lookup (fallback)
    if (empty($access_key)) {
        error_log('ORU: Gateway method failed, trying direct options...');
        
        $option_names = array(
            'woocommerce_montonio_payments_settings',
            'woocommerce_montonio_settings',
            'woocommerce_montonio_payment_initiation_settings',
            'woocommerce_montonio_card_payments_settings',
        );
        
        foreach ($option_names as $option_name) {
            $settings = get_option($option_name, array());
            if (!empty($settings) && is_array($settings)) {
                error_log('ORU: Checking option: ' . $option_name);
                
                if (!empty($settings['access_key'])) {
                    $access_key = $settings['access_key'];
                    $secret_key = isset($settings['secret_key']) ? $settings['secret_key'] : '';
                    $environment = isset($settings['environment']) ? $settings['environment'] : 'sandbox';
                    
                    error_log('ORU: Got credentials from option: ' . $option_name);
                    break;
                }
            }
        }
    }
    
    if (empty($access_key)) {
        error_log('ORU: ERROR - No Montonio credentials found!');
        error_log('ORU: Please go to WooCommerce → Settings → Payments');
        error_log('ORU: Enable Montonio and configure it with your API keys');
        return new WP_Error('montonio_config', 'Montonio not configured. Please enable and configure Montonio in WooCommerce → Settings → Payments');
    }
    
    // Montonio API endpoint
    $api_url = $environment === 'production' 
        ? 'https://stargate.montonio.com/api/orders' 
        : 'https://sandbox-stargate.montonio.com/api/orders';
    
    error_log('ORU: Using Montonio API: ' . $api_url);
    
    // Build return URL
    $return_url = $order->get_checkout_order_received_url();
    $notification_url = rest_url('oru/v1/montonio-webhook');
    
    // Build line items
    $line_items = array();
    foreach ($order->get_items() as $item) {
        $line_items[] = array(
            'name' => $item->get_name(),
            'quantity' => $item->get_quantity(),
            'finalPrice' => floatval($item->get_total()),
        );
    }
    
    // Add shipping
    foreach ($order->get_shipping_methods() as $shipping) {
        if ($shipping->get_total() > 0) {
            $line_items[] = array(
                'name' => $shipping->get_name(),
                'quantity' => 1,
                'finalPrice' => floatval($shipping->get_total()),
            );
        }
    }
    
    // Build payment data
    $payment_data = array(
        'accessKey' => $access_key,
        'merchantReference' => strval($order->get_id()),
        'returnUrl' => $return_url,
        'notificationUrl' => $notification_url,
        'currency' => 'EUR',
        'grandTotal' => floatval($order->get_total()),
        'locale' => 'lt',
        'billingAddress' => array(
            'firstName' => $order->get_billing_first_name(),
            'lastName' => $order->get_billing_last_name(),
            'email' => $order->get_billing_email(),
            'phoneNumber' => $order->get_billing_phone(),
            'addressLine1' => $order->get_billing_address_1(),
            'locality' => $order->get_billing_city(),
            'country' => $order->get_billing_country(),
            'postalCode' => $order->get_billing_postcode(),
        ),
        'lineItems' => $line_items,
    );
    
    // Detect payment method and set correct parameters
    $title_lower = strtolower($payment_method_title);
    
    // CARD PAYMENT
    if (stripos($title_lower, 'kortelė') !== false || 
        stripos($title_lower, 'kortele') !== false || 
        stripos($title_lower, 'card') !== false ||
        stripos($title_lower, 'visa') !== false ||
        stripos($title_lower, 'mastercard') !== false) {
        
        $payment_data['payment'] = array(
            'method' => 'card',
            'methodDisplay' => 'Card Payment',
            'amount' => floatval($order->get_total()),
            'currency' => 'EUR',
        );
        error_log('ORU: Using CARD payment method');
    }
    // APPLE PAY
    elseif (stripos($title_lower, 'apple') !== false && stripos($title_lower, 'pay') !== false) {
        $payment_data['payment'] = array(
            'method' => 'applepay',
            'methodDisplay' => 'Apple Pay',
            'amount' => floatval($order->get_total()),
            'currency' => 'EUR',
        );
        error_log('ORU: Using Apple Pay');
    }
    // GOOGLE PAY
    elseif (stripos($title_lower, 'google') !== false && stripos($title_lower, 'pay') !== false) {
        $payment_data['payment'] = array(
            'method' => 'googlepay',
            'methodDisplay' => 'Google Pay',
            'amount' => floatval($order->get_total()),
            'currency' => 'EUR',
        );
        error_log('ORU: Using Google Pay');
    }
    // BANK PAYMENT (with optional preselection)
    else {
        $payment_data['payment'] = array(
            'method' => 'paymentInitiation',
            'methodDisplay' => $payment_method_title,
            'amount' => floatval($order->get_total()),
            'currency' => 'EUR',
        );
        
        // Bank preselection map
        $bank_map = array(
            'seb' => 'LITAS',
            'swedbank' => 'HABA',
            'luminor' => 'NDEALT21',
            'šiaulių' => 'CBVI',
            'siauliu' => 'CBVI',
            'medicinos' => 'MDBALT22',
            'revolut' => 'REVOLT21',
            'citadele' => 'INDULT2X',
        );
        
        // Check if a specific bank was selected
        foreach ($bank_map as $name => $code) {
            if (stripos($title_lower, $name) !== false) {
                $payment_data['payment']['preferredProvider'] = $code;
                error_log('ORU: Preselecting bank: ' . $name . ' (' . $code . ')');
                break;
            }
        }
        
        if (!isset($payment_data['payment']['preferredProvider'])) {
            error_log('ORU: Using general bank payment (no preselection)');
        }
    }
    
    error_log('ORU: Sending to Montonio API...');
    
    // Send to Montonio
    $response = wp_remote_post($api_url, array(
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode(array('data' => $payment_data)),
        'timeout' => 30,
    ));
    
    if (is_wp_error($response)) {
        error_log('ORU: API Error: ' . $response->get_error_message());
        return $response;
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    
    error_log('ORU: Montonio Response Code: ' . $response_code);
    error_log('ORU: Montonio Response: ' . substr($body, 0, 500));
    
    if ($response_code === 200 || $response_code === 201) {
        if (!empty($data['uuid']) && !empty($data['paymentUrl'])) {
            $order->update_meta_data('_montonio_uuid', $data['uuid']);
            $order->set_transaction_id($data['uuid']);
            $order->save();
            
            error_log('========================================');
            error_log('✅ MONTONIO PAYMENT SUCCESS!');
            error_log('UUID: ' . $data['uuid']);
            error_log('Payment URL: ' . $data['paymentUrl']);
            error_log('========================================');
            
            return array(
                'uuid' => $data['uuid'],
                'payment_url' => $data['paymentUrl'],
            );
        }
    }
    
    $error = isset($data['message']) ? $data['message'] : 'Payment creation failed';
    error_log('========================================');
    error_log('❌ MONTONIO PAYMENT FAILED');
    error_log('Error: ' . $error);
    error_log('Response Code: ' . $response_code);
    error_log('========================================');
    
    return new WP_Error('montonio_error', $error);
}

// ============================================
// MONTONIO WEBHOOK HANDLER
// ============================================
// Note: Montonio plugin handles webhooks automatically
// This is just for compatibility with old orders

function oru_montonio_webhook($request) {
    try {
        $params = $request->get_json_params();
        
        $secret_key = get_option('oru_montonio_secret_key');
        $signature = $request->get_header('X-Montonio-Signature');
        
        if (!oru_verify_montonio_signature($params, $signature, $secret_key)) {
            return new WP_Error('invalid_signature', 'Invalid webhook signature', array('status' => 401));
        }
        
        $order_id = $params['merchant_reference'];
        $order = wc_get_order($order_id);
        
        if (!$order) {
            return new WP_Error('order_not_found', 'Order not found', array('status' => 404));
        }
        
        switch ($params['status']) {
            case 'FINALIZED':
            case 'PAID':
                $order->payment_complete($params['uuid']);
                $order->add_order_note('Payment completed via Montonio');
                break;
                
            case 'ABANDONED':
            case 'VOIDED':
                $order->update_status('cancelled', 'Payment cancelled by customer');
                break;
                
            case 'FAILED':
                $order->update_status('failed', 'Payment failed');
                break;
        }
        
        return new WP_REST_Response(array('success' => true), 200);
        
    } catch (Exception $e) {
        return new WP_Error('webhook_error', $e->getMessage(), array('status' => 500));
    }
}

function oru_verify_montonio_signature($data, $signature, $secret_key) {
    $payload = base64_encode(json_encode($data));
    $expected_signature = hash_hmac('sha256', $payload, $secret_key);
    return hash_equals($expected_signature, $signature);
}

// ============================================
// PAYMENT STATUS ENDPOINT
// ============================================

function oru_get_payment_status($request) {
    $order_id = $request['order_id'];
    $order = wc_get_order($order_id);
    
    if (!$order) {
        return new WP_Error('order_not_found', 'Order not found', array('status' => 404));
    }
    
    return new WP_REST_Response(array(
        'order_id' => $order->get_id(),
        'status' => $order->get_status(),
        'payment_method' => $order->get_payment_method(),
        'total' => $order->get_total(),
        'paid' => $order->is_paid(),
    ), 200);
}

// ============================================
// ADMIN SETTINGS PAGE
// ============================================

add_action('admin_menu', function() {
    add_theme_page(
        'ORU Theme Settings',
        'ORU Settings',
        'manage_options',
        'oru-settings',
        'oru_settings_page'
    );
    
    // Debug page
    add_submenu_page(
        'oru-settings',
        'Debug Montonio Data',
        'Debug Montonio',
        'manage_options',
        'oru-debug-montonio',
        'oru_debug_montonio_page'
    );
});

function oru_settings_page() {
    if (isset($_POST['oru_save_settings'])) {
        check_admin_referer('oru_settings');
        
        update_option('oru_montonio_access_key', sanitize_text_field($_POST['montonio_access_key']));
        update_option('oru_montonio_secret_key', sanitize_text_field($_POST['montonio_secret_key']));
        update_option('oru_montonio_environment', sanitize_text_field($_POST['montonio_environment']));
        
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    $access_key = get_option('oru_montonio_access_key', '');
    $secret_key = get_option('oru_montonio_secret_key', '');
    $environment = get_option('oru_montonio_environment', 'sandbox');
    
    ?>
    <div class="wrap">
        <h1>ORU Theme Settings</h1>
        
        <form method="post" action="">
            <?php wp_nonce_field('oru_settings'); ?>
            
            <h2>Montonio Payment Gateway</h2>
            
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="montonio_environment">Environment</label></th>
                    <td>
                        <select name="montonio_environment" id="montonio_environment">
                            <option value="sandbox" <?php selected($environment, 'sandbox'); ?>>Sandbox (Testing)</option>
                            <option value="production" <?php selected($environment, 'production'); ?>>Production (Live)</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="montonio_access_key">Access Key</label></th>
                    <td>
                        <input type="text" name="montonio_access_key" id="montonio_access_key" 
                               value="<?php echo esc_attr($access_key); ?>" class="regular-text">
                        <p class="description">Get your Montonio API keys from <a href="https://portal.montonio.com" target="_blank">Montonio Portal</a></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="montonio_secret_key">Secret Key</label></th>
                    <td>
                        <input type="password" name="montonio_secret_key" id="montonio_secret_key" 
                               value="<?php echo esc_attr($secret_key); ?>" class="regular-text">
                    </td>
                </tr>
            </table>
            
            <p class="submit">
                <input type="submit" name="oru_save_settings" class="button button-primary" value="Save Settings">
            </p>
        </form>
        
        <hr>
        
        <h2>API Endpoints</h2>
        
        <h3>Webhook URL</h3>
        <p>Configure this URL in your Montonio portal:</p>
        <code><?php echo rest_url('oru/v1/montonio-webhook'); ?></code>
        
        <h3>Pickup Points API</h3>
        <p>Test pickup points endpoint:</p>
        <ul>
            <li>Omniva: <a href="<?php echo rest_url('oru/v1/pickup-points/omniva'); ?>" target="_blank"><code><?php echo rest_url('oru/v1/pickup-points/omniva'); ?></code></a></li>
            <li>DPD: <a href="<?php echo rest_url('oru/v1/pickup-points/dpd'); ?>" target="_blank"><code><?php echo rest_url('oru/v1/pickup-points/dpd'); ?></code></a></li>
            <li>SmartPost: <a href="<?php echo rest_url('oru/v1/pickup-points/smartpost'); ?>" target="_blank"><code><?php echo rest_url('oru/v1/pickup-points/smartpost'); ?></code></a></li>
        </ul>
        
        <hr>
        
        <h2>Shipping Information</h2>
        <p><strong>Pickup Points Endpoint:</strong> <?php echo rest_url('oru/v1/pickup-points/{provider}'); ?></p>
        <p>Supported providers: Omniva, DPD, SmartPost, Venipak, InPost</p>
        <p><strong>Note:</strong> Make sure your shipping method names contain the provider name (e.g., "Omniva Parcel Machines")</p>
    </div>
    <?php
}

// ============================================
// DEBUG MONTONIO PAGE
// ============================================

function oru_debug_montonio_page() {
    ?>
    <div class="wrap">
        <h1>Montonio Settings Debug</h1>
        <p>This page shows what's inside your Montonio shipping settings.</p>
        
        <?php
        $providers = array('omniva', 'dpd', 'venipak', 'smartpost', 'inpost');
        
        foreach ($providers as $provider) {
            echo "<h2>" . ucfirst($provider) . "</h2>";
            
            global $wpdb;
            $results = $wpdb->get_results($wpdb->prepare(
                "SELECT option_name, option_value FROM {$wpdb->options} 
                 WHERE option_name LIKE %s",
                "woocommerce_montonio_{$provider}_%"
            ));
            
            if (empty($results)) {
                echo "<p><em>No settings found for {$provider}</em></p>";
                continue;
            }
            
            foreach ($results as $row) {
                echo "<h3>{$row->option_name}</h3>";
                
                $settings = maybe_unserialize($row->option_value);
                
                if (is_array($settings)) {
                    echo "<table class='wp-list-table widefat fixed striped'>";
                    echo "<thead><tr><th>Setting Key</th><th>Value Type</th><th>Preview</th></tr></thead>";
                    echo "<tbody>";
                    
                    foreach ($settings as $key => $value) {
                        $type = gettype($value);
                        $preview = '';
                        
                        if (is_array($value)) {
                            $preview = count($value) . ' items';
                            
                            if (count($value) > 0) {
                                $first = reset($value);
                                if (is_array($first) && (isset($first['name']) || isset($first['address']))) {
                                    $preview = '<strong style="color: green;">✓ PICKUP POINTS (' . count($value) . ')</strong>';
                                }
                            }
                        } elseif (is_string($value)) {
                            $decoded = json_decode($value, true);
                            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                                $preview = 'JSON array with ' . count($decoded) . ' items';
                            } else {
                                $preview = strlen($value) > 100 ? substr($value, 0, 100) . '...' : $value;
                            }
                        } else {
                            $preview = var_export($value, true);
                        }
                        
                        echo "<tr>";
                        echo "<td><strong>{$key}</strong></td>";
                        echo "<td>{$type}</td>";
                        echo "<td>{$preview}</td>";
                        echo "</tr>";
                    }
                    
                    echo "</tbody></table>";
                    
                    $json = json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                    echo "<details style='margin: 10px 0;'>";
                    echo "<summary style='cursor: pointer; color: #0073aa;'>View Full JSON Data</summary>";
                    echo "<pre style='background: #f5f5f5; padding: 10px; overflow: auto; max-height: 400px;'>";
                    echo esc_html($json);
                    echo "</pre>";
                    echo "</details>";
                } else {
                    echo "<pre>" . esc_html(print_r($settings, true)) . "</pre>";
                }
                
                echo "<hr>";
            }
        }
        ?>
        
        <hr style="margin: 30px 0;">
        
        <h2>Test API Endpoints</h2>
        <ul>
            <li><a href="<?php echo rest_url('oru/v1/pickup-points/omniva'); ?>" target="_blank">Test Omniva Endpoint</a></li>
            <li><a href="<?php echo rest_url('oru/v1/pickup-points/dpd'); ?>" target="_blank">Test DPD Endpoint</a></li>
            <li><a href="<?php echo rest_url('oru/v1/pickup-points/venipak'); ?>" target="_blank">Test Venipak Endpoint</a></li>
        </ul>
    </div>
    <?php
}

// ============================================
// CUSTOM PRODUCT ATTRIBUTES
// ============================================

add_action('woocommerce_product_options_general_product_data', function() {
    echo '<div class="options_group">';
    
    woocommerce_wp_select(array(
        'id' => 'sweetness',
        'label' => 'Sweetness Level',
        'options' => array(
            '1' => 'Low',
            '2' => 'Medium',
            '3' => 'High',
        ),
    ));
    
    woocommerce_wp_select(array(
        'id' => 'throat_hit',
        'label' => 'Throat Hit Level',
        'options' => array(
            '1' => 'Low',
            '2' => 'Medium',
            '3' => 'High',
        ),
    ));
    
    echo '</div>';
});

add_action('woocommerce_process_product_meta', function($post_id) {
    update_post_meta($post_id, 'sweetness', $_POST['sweetness']);
    update_post_meta($post_id, 'throat_hit', $_POST['throat_hit']);
});
// ============================================
// REACT BROWSERROUTER SUPPORT
// ============================================

/**
 * Add rewrite rules for React routes
 * This tells WordPress to let React handle these routes
 */
function oru_add_react_rewrite_rules() {
    // Privacy Policy page
    add_rewrite_rule(
        '^privacy-policy/?$',
        'index.php?pagename=privacy-policy',
        'top'
    );
    
    // Terms and Conditions page
    add_rewrite_rule(
        '^terms/?$',
        'index.php?pagename=terms',
        'top'
    );
    
    // About page
    add_rewrite_rule(
        '^about/?$',
        'index.php?pagename=about',
        'top'
    );
    
    // Contact page
    add_rewrite_rule(
        '^contact/?$',
        'index.php?pagename=contact',
        'top'
    );
    
    // Checkout routes (keep existing)
    add_rewrite_rule(
        '^checkout/?$',
        'index.php?oru_route=checkout',
        'top'
    );
    
    add_rewrite_rule(
        '^checkout/full/?$',
        'index.php?oru_route=checkout-full',
        'top'
    );
    
    add_rewrite_rule(
        '^checkout/filters/?$',
        'index.php?oru_route=checkout-filters',
        'top'
    );
    
    add_rewrite_rule(
        '^checkout/couple/?$',
        'index.php?oru_route=checkout-couple',
        'top'
    );
}
add_action('init', 'oru_add_react_rewrite_rules');

/**
 * Register custom query vars
 */
function oru_register_query_vars($vars) {
    $vars[] = 'oru_route';
    return $vars;
}
add_filter('query_vars', 'oru_register_query_vars');

/**
 * Flush rewrite rules on theme activation
 * IMPORTANT: This makes sure the rules are registered
 */
function oru_flush_rewrite_rules_on_activation() {
    oru_add_react_rewrite_rules();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'oru_flush_rewrite_rules_on_activation');

/**
 * Create WordPress pages automatically on theme activation
 */
function oru_create_required_pages() {
    $pages = array(
        array(
            'title' => 'About Us',
            'slug' => 'about',
        ),
        array(
            'title' => 'Contact',
            'slug' => 'contact',
        ),
        array(
            'title' => 'Privatumo Politika',
            'slug' => 'privacy-policy',
        ),
        array(
            'title' => 'Sąlygos ir Taisyklės',
            'slug' => 'terms',
        ),
    );
    
    foreach ($pages as $page_data) {
        // Check if page already exists
        $existing_page = get_page_by_path($page_data['slug']);
        
        if (!$existing_page) {
            // Create the page
            wp_insert_post(array(
                'post_title'    => $page_data['title'],
                'post_name'     => $page_data['slug'],
                'post_content'  => '<!-- React will render here -->',
                'post_status'   => 'publish',
                'post_type'     => 'page',
                'post_author'   => 1,
                'comment_status' => 'closed',
                'ping_status'   => 'closed',
            ));
        }
    }
}
add_action('after_switch_theme', 'oru_create_required_pages');

/**
 * Template redirect for React routes
 * This ensures all React routes use the main template
 */
function oru_react_route_template_redirect() {
    $oru_route = get_query_var('oru_route');
    
    if ($oru_route) {
        // Let index.php handle it (React will take over)
        include(get_template_directory() . '/index.php');
        exit;
    }
}
add_action('template_redirect', 'oru_react_route_template_redirect');