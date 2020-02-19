import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import DateFilter from './DateFilter.component';
import Grid from './Grid.component';
import { TimelineContext } from './context';
import theme from './Timeline.scss';

/*
Filters = array of {id, predicate(item)}
 */
function useFilters(defaultFilters = []) {
	const [filters, setFilters] = useState(defaultFilters);

	const addFilters = filterDefs => {
		setFilters(filters.concat(filterDefs));
	};

	const removeFilters = filterIds => {
		const toRemove = Array.isArray(filterIds) ? filterIds : [filterIds];
		const newFilters = filters.filter(({ id }) => !toRemove.includes(id));
		setFilters(newFilters);
	};

	return {
		filters,
		addFilters,
		removeFilters,
	};
}

function Toolbar({ children }) {
	return <div className={theme.toolbar}>{children}</div>;
}

export default function Timeline({
	data = [],
	children,
	startName = 'start',
	endName = 'end',
	groupIdName = 'groupId',
	groupLabelName = 'groupLabel',
}) {
	const { filters, addFilters, removeFilters } = useFilters();
	const filteredData = useMemo(
		() => data.filter(item => filters.every(({ predicate }) => predicate(item))),
		[data, filters],
	);
	return (
		<TimelineContext.Provider
			value={{
				filters,
				addFilters,
				removeFilters,
				data: filteredData,
				startName,
				endName,
				groupIdName,
				groupLabelName,
			}}
		>
			<div className={theme.layout}>{children}</div>
		</TimelineContext.Provider>
	);
}

Timeline.propTypes = {
	data: PropTypes.arrayOf(PropTypes.object),
	children: PropTypes.node,
	startName: PropTypes.string,
	endName: PropTypes.string,
	groupIdName: PropTypes.string,
	groupLabelName: PropTypes.string,
};
Timeline.Toolbar = Toolbar;
Timeline.DateFilter = DateFilter;
Timeline.Grid = Grid;
