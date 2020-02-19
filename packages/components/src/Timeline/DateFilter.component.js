import React from 'react';
import PropTypes from 'prop-types';
import InputDateTimeRange from '../DateTimePickers/InputDateRangePicker';
import { useTimelineContext } from './context';

export default function DateFilter() {
	const { filters, addFilters, removeFilters } = useTimelineContext();
	return <InputDateTimeRange onChange={(...args) => console.log(...args)} />;
}
