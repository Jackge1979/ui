import React from 'react';
import PropTypes from 'prop-types';
import InputDateTimeRangePicker from '../DateTimePickers/InputDateTimeRangePicker';
import { useTimelineContext } from './context';

const DATE_FILTER_ID = 'date-range';
export default function DateFilter({ initialStart, initialEnd, ...restProps }) {
	const { addFilters, removeFilters, startName, endName } = useTimelineContext();
	const defaultTime = {
		hours: '00',
		minutes: '00',
		seconds: '00',
	};

	const onChange = (_, payload) => {
		const { startDateTime, endDateTime, errors } = payload;
		if (!errors.length) {
			const startFilterTimestamp = startDateTime.getTime();
			const endFilterTimestamp = endDateTime.getTime();
			removeFilters(DATE_FILTER_ID);
			addFilters({
				id: DATE_FILTER_ID,
				predicate: item =>
					item[startName] >= startFilterTimestamp && item[endName] <= endFilterTimestamp,
			});
		}
	};
	return (
		<form style={{ marginLeft: 'auto' }}>
			<InputDateTimeRangePicker
				defaultTimeStart={defaultTime}
				defaultTimeEnd={defaultTime}
				startDateTime={initialStart}
				endDateTime={initialEnd}
				useSeconds
				onChange={onChange}
				{...restProps}
			/>
		</form>
	);
}
