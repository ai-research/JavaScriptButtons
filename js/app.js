/*jshint jquery:true */
/*global PAYPAL:true */

(function () {
	'use strict';


	$('.modal').on('shown', function (e) {
		// Focus on the first input when modal is available
		$(this).find(':input:text:enabled:first').focus();
	});


	$(document).on('click', '[data-modal-save="true"]', function (e) {
		var data = {},
			modal = $(this).parents('.modal').first(),
			example = modal.closest('.example'),
			code = example.find('code'),
			tryit = example.find('.tryit'),
			inputs = modal.find('.modal-body :input'),
			requiredInputs = modal.find('[required="required"]'),
			input, merchant, el, len, i, key, button;


		// Don't update if we don't have all of the required inputs
		// TODO: This can be cleaned up
		for (i = 0, len = requiredInputs.length; i < len; i++) {
			var requiredInput = $(requiredInputs[i]),
				controlGroup = requiredInput.parents('.control-group').first();

			if (requiredInput.val() === '') {
				controlGroup.addClass('error');
				requiredInput.focus();

				return;
			} else {
				controlGroup.removeClass('error');
			}
		}

		// Build a map out of the form data
		for (i = 0, len = inputs.length; i < len; i++) {
			input = $(inputs[i]);

			if(input.is(':checkbox')) {
				if(input.is(':checked')) {
					data[input.attr('name')] = {
						value: input.val()
					};
				}
			} else {
				data[input.attr('name')] = {
					value: input.val()
				};
			}
		}

		// Create a script tag to use as the HTML
		el = document.createElement('script');
		el.setAttribute('async', 'async');

		if (data.button && data.button.value === 'cart') {
			el.src = 'https://www.paypalobjects.com/js/external/paypal-button-minicart.min.js?merchant=' + data.business.value;
		} else {
			el.src = 'https://ai-research.github.io/JavaScriptButtons/dist/paypal-custom-button-inr.js?merchant=' + data.business.value;
		}

		for (key in data) {
			if (key !== 'business' && data[key].value !== '') {
				el.setAttribute('data-' + key, data[key].value);
			}
		}

		code.text(el.outerHTML.replace(/data-/g, "\n    data-").replace("></" + "script>", "\n></" + "script>"));

		// Update the button
		button = PAYPAL.apps.ButtonFactory.create(data.business.value, data, data.button.value);
		button = $(button);
		button.css('display', 'none');

		tryit.empty();
		tryit.append(button);
		tryit.animate({
			height: (button.height() || 130) * 2
		}, 300, function () {
			button.fadeTo(300, 1);
		});

		// Close the modal
		modal.modal('hide');

		// Track Events
		if (data.button) {
			_gaq.push(['_trackEvent', 'JavaScriptButtons', data.button.value]);
		}
	});

}());
