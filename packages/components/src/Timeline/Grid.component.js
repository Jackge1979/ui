import React, { useMemo } from 'react';
import { useTimelineContext } from './context';

import theme from './Grid.scss';

function useData() {
	const { data, startName, endName, groupIdName, groupLabelName } = useTimelineContext();
	return useMemo(() => {
		const groups = data.reduce((accu, item) => {
			const groupId = item[groupIdName] || 'default';
			let group = accu[groupId];
			if (!group) {
				group = {
					id: groupId,
					label: item[groupLabelName] || 'Default',
					items: [],
				};
				accu[groupId] = group;
			}
			group.items.push(item);
			return accu;
		}, {});
		Object.values(groups).forEach(group => {
			const { items } = group;
			items.sort((item1, item2) => item1[startName] - item2[startName]);
			group.start = items[0][startName];
			group.end = items[items.length][endName];
		});
		return Object.values(groups);
	}, [data]);
}

export default function Grid() {
	const groups = useData();
	console.log(groups);
	const startTimestamp = groups.reduce(
		(accu, group) => (!accu || accu > group.start ? group.start : accu),
		0,
	);
	const endTimestamp = groups.reduce(
		(accu, group) => (!accu || accu > group.end ? group.end : accu),
		0,
	);
	const startDate = new Date(startTimestamp);
	startDate.setHours(0);
	startDate.setMinutes(0);
	startDate.setSeconds(0);
	const endDate = new Date(endTimestamp);
	endDate.setHours(0);
	endDate.setMinutes(0);
	endDate.setSeconds(0);

	return (
		<div>
			<div className={theme.head}>
				<div className={theme.row}>
					<div className={theme.sticky}></div>
					<div></div>
				</div>
			</div>
			<div className={theme.body}>
				{groups.map(group => {
					return (
						<div className={theme.row}>
							<div className={theme.sticky}>{group.label}</div>
							<div className={theme['data-group']}></div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
