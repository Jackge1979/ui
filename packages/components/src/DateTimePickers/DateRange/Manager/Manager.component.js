import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import isBefore from 'date-fns/is_before';

import { DateRangeContext } from '../Context';
import getErrorMessage from '../../shared/error-messages';

import {
	extractDate,
	extractFromDate,
	extractPartsFromTextInput,
} from '../../Date/date-extraction';
import extractTime, { getTimeFormat } from '../../Time/time-extraction';
import { dateAndTimeToDateTime, extractParts } from '../../DateTime/datetime-extraction';

export function DateRangePickerException(code, message) {
	this.message = getErrorMessage(message);
	this.code = code;
}

function extractRangeParts(startDate, endDate, options) {
	const startDateTime = extractParts(startDate, options);
	const endDateTime = extractParts(endDate, options);

	const startDateParts = extractDate(startDateTime.date, options);
	const endDateParts = extractDate(endDateTime.date, options);
	const startTimeParts = extractTime(startDateTime.time, options.useSeconds);
	const endTimeParts = extractTime(endDateTime.time, options.useSeconds);

	const errors = [
		...(startDateTime.errors || []),
		...(endDateTime.errors || []),
		...(startDateParts.errors || []),
		...(endDateParts.errors || []),
		...(startTimeParts.errors || []),
		...(endTimeParts.errors || []),
	];

	return {
		startDate: {
			value: startDateParts.localDate,
			textInput: startDateParts.textInput,
		},
		endDate: {
			value: endDateParts.localDate,
			textInput: endDateParts.textInput,
		},
		startTime: {
			value: startTimeParts.value,
			textInput: startTimeParts.textInput,
		},
		endTime: {
			value: endTimeParts.value,
			textInput: endTimeParts.textInput,
		},
		errors,
		errorMessage: errors[0] ? errors[0].message : null,
	};
}

function ContextualManager(props) {
	const options = {
		dateFormat: props.dateFormat,
	};
	const initialState = extractRangeParts(props.startDate, props.endDate, options);
	const [state, setState] = useState(initialState);

	useEffect(() => {
		if (props.startDate !== state.startDate.value || props.endDate !== state.endDate.value) {
			const parts = extractRangeParts(props.startDate, props.endDate, options);
			setState(parts);
		}
	}, [props.startDate, props.endDate]);

	function onChange(event, nextState) {
		const errors = [...(nextState.errors || [])];
		const startDate = nextState.startDate.value;
		const endDate = nextState.endDate.value;

		const startTime = nextState.startTime.value;
		const endTime = nextState.endTime.value;

		if (startDate && endDate) {
			if (!isBefore(startDate, endDate)) {
				errors.push(
					new DateRangePickerException(
						'INVALID_RANGE_START_AFTER_END',
						'INVALID_RANGE_START_AFTER_END',
					),
				);
			}
		}

		let startDateTime = null;
		let endDateTime = null;
		if (startDate && startTime) {
			startDateTime = dateAndTimeToDateTime(startDate, startTime, options);
		}
		if (endDate && endTime) {
			endDateTime = dateAndTimeToDateTime(endDate, endTime, options);
		}

		if (props.onChange) {
			const payload = {
				startDateTime,
				endDateTime,
				errors,
				errorMessage: errors[0] ? errors[0].message : null,
				origin: nextState.origin,
			};
			props.onChange(event, payload);
		}
	}

	function onStartChange(event, { date: startDate }) {
		const { date, textInput, errors, errorMessage } = extractFromDate(startDate, options);
		const nextState = {};

		nextState.startDate = {
			value: date,
			textInput,
		};
		nextState.errors = errors;
		nextState.errorMessage = errorMessage;

		setState(prevState => ({
			...prevState,
			...nextState,
		}));
		onChange(event, { ...state, ...nextState, origin: 'START_PICKER' });
	}

	function onEndChange(event, { date: endDate }) {
		const { date, textInput, errors, errorMessage } = extractFromDate(endDate, options);
		const nextState = {};

		nextState.endDate = {
			value: date,
			textInput,
		};
		nextState.errors = errors;
		nextState.errorMessage = errorMessage;

		setState(prevState => ({
			...prevState,
			...nextState,
		}));
		onChange(event, { ...state, ...nextState, origin: 'END_PICKER' });
	}

	function onStartInputChange(event) {
		const userInput = event.target.value;
		const { localDate, textInput, errors, errorMessage } = extractPartsFromTextInput(
			userInput,
			options,
		);
		const nextState = {
			startDate: {
				value: localDate,
				textInput,
			},
			errors,
			errorMessage,
		};
		setState(prevState => ({
			...prevState,
			...nextState,
		}));
		onChange(event, { ...state, ...nextState, origin: 'START_INPUT' });
	}

	function onEndInputChange(event) {
		const userInput = event.target.value;
		const { localDate, textInput, errors, errorMessage } = extractPartsFromTextInput(
			userInput,
			options,
		);
		const nextState = {
			endDate: {
				value: localDate,
				textInput,
			},
			errors,
			errorMessage,
		};
		setState(prevState => ({
			...prevState,
			...nextState,
		}));
		onChange(event, { ...state, ...nextState, origin: 'END_INPUT' });
	}

	function onTimeInputChange(event, type, origin) {
		const timeInput = event.target.value;
		const { time, textInput, errors, errorMessage } = extractTime(timeInput, false);
		const nextState = {
			[type]: {
				value: time,
				textInput,
			},
			errors,
			errorMessage,
		};
		setState(prevState => ({
			...prevState,
			...nextState,
		}));
		onChange(event, { ...state, ...nextState, origin });
	}

	function onTimePickerChange(event, { textInput, time }, type, origin) {
		const nextState = {
			[type]: {
				value: time,
				textInput,
			},
		};
		setState(prevState => ({
			...prevState,
			...nextState,
		}));
		onChange(event, { ...state, ...nextState, origin });
	}

	return (
		<DateRangeContext.Provider
			value={{
				startDate: state.startDate,
				endDate: state.endDate,
				startTime: state.startTime,
				endTime: state.endTime,
				inputManagement: {
					onStartChange: onStartInputChange,
					onEndChange: onEndInputChange,
					onTimeChange: onTimeInputChange,
					placeholder: props.dateFormat,
					timePlaceholder: getTimeFormat(props.useSeconds),
				},
				pickerManagement: {
					onStartChange,
					onEndChange,
					onTimeChange: onTimePickerChange,
				},
			}}
		>
			{props.children}
		</DateRangeContext.Provider>
	);
}
ContextualManager.defaultProps = {
	dateFormat: 'YYYY-MM-DD',
	useSeconds: false,
};
ContextualManager.displayName = 'DateRange.Manager';
ContextualManager.propTypes = {
	children: PropTypes.element,
	startDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string]),
	endDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string]),
	dateFormat: PropTypes.string,
	useSeconds: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
};

export default ContextualManager;
