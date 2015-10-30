/**
* Layers Customizer JS file
*
* This file contains global widget functions
 *
 * @package Layers
 * @since Layers 1.0.0
 * Contents
 * 1 - Page Builder Macro
 * 2 - Customizer UI enhancements
 * 3 - Better history states in customizer
 * 4 - Customizer UX Enhancements
 *
 * Author: Obox Themes
 * Author URI: http://www.oboxthemes.com/
 * License: GNU General Public License v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/

( function( exports, $ ) {

	"use strict";

	// Check if customizer exists
	if ( ! wp || ! wp.customize ) return;

	// WordPress Stuff
	var	api = wp.customize,
		Previewer;

	// Global Elements
	var	$save_button = $( '#customize-header-actions input#save' ),
		$save_spinner = $( '#customize-header-actions .spinner' );

	// Global Vars
	var	$var = 'var';

	// New Customizer Previewer class
	api.LayersCustomizerPreviewer = {

		init: function () {

			var $that = this;
			
			var $hash_record = '';

			/**
			 * 1 - Page Builder Macro
			 */

			if( true == layers_customizer_params.builder_page ){
				// Jump into the Widget editor block on Layers Page - DISABLED
				//$( 'li[id*="accordion-section-sidebar-widgets-obox-layers-builder"] .accordion-section-title' ).trigger( 'click' );
			}

			/**
			 * 2 - Customizer UI enhancements
			 */

			var layers_builder_pages_drop_down = '.layers-customizer-pages-dropdown select',
				layers_previous_page_url;

			// Helper to get current url
			// provide default_url fix for when no querystring 'url' exists,
			// which happens when coming from Appearance > Customizer
			if( !wp.customize.previewer ) return;

			var default_url = wp.customize.previewer.previewUrl();
			function layers_get_customizer_url() {
				if( layers_get_parameter_by_name('url', window.location) ){
					return layers_get_parameter_by_name('url', window.location);
				}
				else {
					return default_url;
				}
			}

			// Helper to get query stings by param name - like query strings.
			function layers_get_parameter_by_name(name, url) {
				name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
				var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
					results = regex.exec(url);
				return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
			}

			// Change the customizer url when the dropdown is changed.
			$(document).on('change', layers_builder_pages_drop_down, function(){
				var new_preview_url = $(this).val();
				if ( new_preview_url != wp.customize.previewer.previewUrl() ){
					wp.customize.previewer.previewUrl( $(this).val() );
					layers_add_history_state();
					layers_update_customizer_interface();
				}
			});

			// Update the UI when customizer url changes
			// eg when an <a> in the preview window is clicked
			function layers_update_customizer_interface() {
				
				//Update the dropdown
				if( $(layers_builder_pages_drop_down + ' option[value="' + wp.customize.previewer.previewUrl() + '"]').length ){
					$(layers_builder_pages_drop_down).val( wp.customize.previewer.previewUrl() );
				} else {
					$(layers_builder_pages_drop_down).val( 'init' );
				}

				// Change the 'X' close button
				$('.customize-controls-close').attr('href', wp.customize.previewer.previewUrl() );

				// Change the 'Preview Page' button
				$('.customize-controls-layers-button-preview').attr('href', layers_get_customizer_url() );
				
				if ( $hash_record ) setTimeout( function() { window.location.hash = $hash_record }, 1000 );
			}
			layers_update_customizer_interface();

			// Listen for event when customizer url changes
			function layers_handle_customizer_talkback() {
				layers_add_history_state();
				layers_update_customizer_interface();
			}
			wp.customize.previewer.bind('url', layers_handle_customizer_talkback);

			// Move the Layers custom buttons to correct place - no hook available.
			$('#customize-header-actions').append( $('#customize-controls-layers-actions') );
			$('#customize-controls-layers-actions').css({ 'display':'block', 'visibility':'visible' });

			// Move the Layers tooltips to correct place.
			$('.customize-controls-close').addClass('layers-tooltip layers-tooltip-left').prepend( $('.layers-tooltip-text-close') );
			$('.control-panel-back').addClass('layers-tooltip layers-tooltip-left').prepend( $('.layers-tooltip-text-back') );
			
			// Delay showing of main nav with hoverIntent
			$( 'ul.layers-customizer-nav > li' ).hoverIntent(
				function() { $( this ).addClass( 'layers-hover' ); },
				function() { $( this ).removeClass( 'layers-hover' ); }
			);

			/**
			 * 3 - Better history states in customizer
			 *
			 * TODO: Check WP bleeding edge versions for this functionality.
			 * https://core.trac.wordpress.org/ticket/28536
			 */

			// Add history state customizer changes
			function layers_add_history_state(){
				// Update the browser URl so page can be refreshed
				if (window.history.pushState) {
					// Newer Browsers only (IE10+, Firefox3+, etc)
					var url = window.location.href.split('?')[0] + "?url=" + wp.customize.previewer.previewUrl();
					window.history.pushState({}, "", url);
				}
			}

			// Listen for changes in history state - eg push of the next/prev botton
			window.addEventListener('popstate', function(e){
				wp.customize.previewer.previewUrl( layers_get_customizer_url() );
				layers_update_customizer_interface();
			}, false);

			$(document).on( 'change', '.layers-customize-control-font select', function(){
				// "Hi Mom"
				$that        = $(this);
				$description = $that.closest( '.layers-customize-control-font' ).find( '.customize-control-description' );
				$description.find( 'a' ).attr( 'href' , $description.data( 'base-url' ) + $that.val() );
			});

			/**
			 * 4 - Customizer UX Enhancements
			 *
			 * Handle edit buttons and and other UI elemnts
			 */

			// Edit widget buttons
			this.preview.bind( 'layers-open-widget', function( data ) {

				// Get the widget form
				var $widget_element = $( '#' + data.id );

				// Close widget form if expanded
				if ( ! $widget_element.hasClass( 'expanded' ) ) {
					$widget_element.find( '.widget-top' ).click();
				}
			});

			// Close all expanded widgets
			this.preview.bind( 'layers-close-all-widgets', function( data ) {

				$( '.customize-control-widget_form.expanded' ).find( '.widget-inside' ).hide();
				$( '.customize-control-widget_form.expanded' ).find( '.widget-control-close' ).click();
				
				//$( '.customize-control-widget_form.expanded' ).addClass('layers-peek'); // Peek (Disabled. Testing Only)
			});
			
			// Widget Peek (Disabled. Testing Only)
			/*
			$(document).on( 'mouseleave', '#customize-preview', function(){
				$( '.customize-control-widget_form.expanded' ).removeClass('layers-peek');
			});
			*/
		
			/**
			 * Deep linking into Controls.
			 */
			 
			var enable_deep_linking = false;
			if ( 1 == layers_customizer_params.enable_deep_linking ) enable_deep_linking = true;
			
			// Open item if hash is set.
			if ( window.location.hash ) {

				var $hash = window.location.hash.split('#')[1];
				var $element = $( '#' + $hash );
				if ( $element.length ) {
					$hash_record = $hash;
					//$('#accordion-section-layers-pro-buttons').
					$element
						.children('.accordion-section-title')
						.click();
					
					$element
						.children('.widget')
						.find('.widget-title')
						.click();
				}
			}
			
			if ( 1 == layers_customizer_params.enable_deep_linking ) {
				
				// Accordion Open (set the hash)
				$(document).on( 'click', '.accordion-section-title', function(){
					if ( !enable_deep_linking ) return false;
					
					var $element = $(this);
					var $parent_accordion = $element.parent('li.accordion-section');
					
					// Bail if this is not a control.
					if ( ! $parent_accordion.length ) return;
					
					var $id = $parent_accordion.attr('id');
					window.location.hash = $id;
					$hash_record = $id;
				});
				// Section Back-Button (set the hash)
				$(document).on( 'click', '.customize-section-back', function(){
					var $element = $(this);
					var $parent_accordion = $element.parents('li.accordion-section').eq(1);
					
					// Bail if this is not a control.
					if ( ! $parent_accordion.length ) return;
					
					var $id = $parent_accordion.attr('id');
					window.location.hash = $id;
					$hash_record = $id;
				});
				// Panel Back-Button (set the hash)
				$(document).on( 'click', '.customize-panel-back', function(){
					window.location.hash = '';
					$hash_record = '';
				});
				
				// Widget Open (set the hash)
				$(document).on( 'click', '.widget-title', function(){
					var $element = $(this);
					var $parent_accordion = $element.parents('li.customize-control-widget_form');
					
					// Bail if this is not a control.
					if ( ! $parent_accordion.length ) return;
					
					var $id = $parent_accordion.attr('id');
					window.location.hash = $id;
					$hash_record = $id;
				});
				// Widget Close (set the hash)
				$(document).on( 'click', '.widget-control-close', function(){
					var $element = $(this);
					var $parent_accordion = $element.parents('li.accordion-section').eq(0);
					
					// Bail if this is not a control.
					if ( ! $parent_accordion.length ) return;
					
					var $id = $parent_accordion.attr('id');
					window.location.hash = $id;
					$hash_record = $id;
				});
				
			}
			
			/**
			 * Dev Switches.
			 */
			var $dev_switch_hash = ( window.location.hash ) ? window.location.hash.split('#')[1] : '';
			if ( $( '#layers-dev-switch-active' ).length ) {
				if ( 'layers-dev-switches' == $dev_switch_hash ) {
					if( ! $( '#layers-dev-switch-active' ).attr( 'checked' ) ) {
						$( '#layers-dev-switch-active' ).attr( 'checked', true ).change();
						$( '#accordion-section-layers-dev-switches > h3' ).click();
					}
				}
			}
			
		}
	};

	// Cache Preview
	Previewer = api.Previewer;
	api.Previewer = Previewer.extend({
		initialize: function( params, options ) {

			// cache the Preview
			api.LayersCustomizerPreviewer.preview = this;

			// call the Previewer's initialize function
			Previewer.prototype.initialize.call( this, params, options );
		}
	} );

	// On document ready
	$( function() {

		// Initialize Layers Previewer
		api.LayersCustomizerPreviewer.init();
	} );

} )( wp, jQuery );