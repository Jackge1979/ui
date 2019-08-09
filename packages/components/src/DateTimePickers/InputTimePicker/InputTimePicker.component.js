/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import keycode from 'keycode';
import uuid from 'uuid';
import { Popper } from 'react-popper';

import FocusManager from '../../FocusManager';
import { DateTimeContext } from '../DateTime/Context';
import DateTime from '../DateTime';
import TimePicker from '../DateTime/Picker/TimePicker';
import { focusOnCalendar } from '../../Gesture/withCalendarGesture';

import theme from './InputTimePicker.scss';

const PROPS_TO_OMIT_FOR_INPUT = [
	'dateFormat',
	'formMode',
	'id',
	'required',
	'selectedDateTime',
	'useSeconds',
	'useTime',
	'useUTC',
	'onBlur',
	'onChange',
];

class InputTimePicker extends React.Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
		selectedDateTime: PropTypes.oneOfType([
			PropTypes.instanceOf(Date),
			PropTypes.number,
			PropTypes.string,
		]),
		onChange: PropTypes.func,
		onBlur: PropTypes.func,
		readOnly: PropTypes.bool,
		dateFormat: PropTypes.string,
		useUTC: PropTypes.bool,
		formMode: PropTypes.bool,
		required: PropTypes.bool,
	};

	static defaultProps = {
		dateFormat: 'YYYY-MM-DD',
		useSeconds: false,
		useTime: false,
		useUTC: false,
		formMode: false,
		// default behaviour is to forbid empty values
		required: true,
	};

	constructor(props) {
		super(props);

		this.popoverId = `input-time-picker-${props.id || uuid.v4()}`;
		this.state = {
			showPicker: false,
		};

		this.onBlur = this.onBlur.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.openPicker = this.setPickerVisibility.bind(this, true);
		this.closePicker = this.setPickerVisibility.bind(this, false);
	}

	onKeyDown(event, { onReset }) {
		switch (event.keyCode) {
			case keycode.codes.esc:
				onReset();
				this.inputRef.focus();
				this.closePicker();
				break;
			case keycode.codes.down:
				if (event.target !== this.inputRef) {
					return;
				}

				if (this.state.showPicker) {
					focusOnCalendar(this.containerRef);
				} else {
					this.openPicker();
				}
				break;
			default:
				break;
		}
	}

	onBlur(event, { onReset }) {
		onReset();
		this.closePicker({ picked: false });
		if (this.props.onBlur) {
			this.props.onBlur(event);
		}
	}

	onFocus() {
		if (!this.state.picked) {
			this.openPicker();
		}
	}

	onClick() {
		this.openPicker();
	}

	onChange(event, payload) {
		this.props.onChange(event, payload);
		if (
			this.props.formMode ||
			(!this.props.formMode && payload.origin !== 'INPUT')
		) {
			// this.inputRef.focus();
			// this.closePicker({ picked: true });
		}
	}

	getPopperPlacement() {
		const input = this.inputRef;
		if (input) {
			const inputDimensions = input.getBoundingClientRect();
			if (inputDimensions.left > window.innerWidth / 2) {
				return 'bottom-end';
			}
		}
		return 'bottom-start';
	}

	setPickerVisibility(isShown, extra = {}) {
		if (this.props.readOnly) {
			return;
		}

		this.setState(({ showPicker }) => {
			if (showPicker === isShown) {
				return extra;
			}
			return {
				showPicker: isShown,
				...extra,
			};
		});
	}

	render() {
		const inputProps = omit(this.props, PROPS_TO_OMIT_FOR_INPUT);
		const timePicker = [
			<DateTime.Input
				{...inputProps}
				id={`${this.props.id}-time-input`}
				key="input"
				inputRef={ref => {
					this.inputRef = ref;
				}}
				placeholder="HH:mm"
				inputType="time"
			/>,
			this.state.showPicker && (
				<Popper
					key="popper"
					modifiers={{
						hide: {
							enabled: false,
						},
						preventOverflow: {
							enabled: false,
						},
					}}
					placement={this.getPopperPlacement()}
					positionFixed
					referenceElement={this.inputRef}
				>
					{({ ref, style }) => (
						<div id={this.popoverId} className={theme.popper} style={style} ref={ref}>
							<TimePicker {...this.props} />
							{this.props.formMode && <DateTime.Validation />}
						</div>
					)}
				</Popper>
			),
		].filter(Boolean);

		return (
			<DateTimeContext.Consumer>
				{({ formManagement }) => (
					<FocusManager
						style={{ display: 'inline-block' }}
						divRef={ref => {
							this.containerRef = ref;
						}}
						onClick={this.onClick}
						onFocusIn={this.onFocus}
						onFocusOut={event => {
							this.onBlur(event, formManagement);
						}}
						onKeyDown={event => {
							this.onKeyDown(event, formManagement);
						}}
					>
						{this.props.formMode ? (
							<form key="form" onSubmit={formManagement.onSubmit}>
								{timePicker}
							</form>
						) : (
								timePicker
						)}
					</FocusManager>
				)}
			</DateTimeContext.Consumer>
		);
	}
}
export default InputTimePicker;