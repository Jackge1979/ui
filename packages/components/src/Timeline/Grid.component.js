import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import format from 'date-fns/format';
import keycode from 'keycode';
import getLocale from '../DateFnsLocale/locale';
import TooltipTrigger from '../TooltipTrigger';

import { useTimelineContext } from './context';

import theme from './Grid.scss';

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_DAY_LENGTH = 1500;
const DEFAULT_HEIGHT = 3; // rem
const DEFAULT_DATA_HEIGHT = 2; //rem
const MIN_DATA_WIDTH = 3; // px

const HOURS = new Array(24).fill(0).map((_, index) => index);

function useData() {
	const context = useTimelineContext();
	const { data, startName, endName, groupIdName, groupLabelName } = context;
	const dataGroups = useMemo(() => {
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

		let globalStart;
		let globalEnd;
		Object.values(groups).forEach(group => {
			const { items } = group;
			items.sort((item1, item2) => item1[startName] - item2[startName]);
			const itemStart = items[0][startName];
			const itemEnd = items[items.length - 1][endName];
			if (!globalStart || globalStart > itemStart) {
				globalStart = itemStart;
			}
			if (!globalEnd || globalEnd < itemEnd) {
				globalEnd = itemEnd;
			}
		});

		const globalStartDate = new Date(globalStart);
		globalStartDate.setHours(0);
		globalStartDate.setMinutes(0);
		globalStartDate.setSeconds(0);

		const globalEndDate = new Date(globalEnd);
		globalEndDate.setHours(0);
		globalEndDate.setMinutes(0);
		globalEndDate.setSeconds(0);
		globalEndDate.setDate(globalEndDate.getDate() + 1);

		return {
			groups: Object.values(groups),
			timeRange: [globalStartDate.getTime(), globalEndDate.getTime()],
		};
	}, [data]);

	return {
		...dataGroups,
		...context,
	};
}

export default function Grid() {
	const { t } = useTranslation();
	const locale = useMemo(() => ({ locale: getLocale(t) }), [t]);
	const ref = React.createRef();

	const {
		groups,
		timeRange,
		idName,
		startName,
		endName,
		dataItemProps,
		onClick,
		dataItemTooltip,
		zoom,
	} = useData();

	const [startTimestamp, endTimestamp] = timeRange;
	const dayLength = DEFAULT_DAY_LENGTH * zoom;
	const pxPerMs = dayLength / MILLISECONDS_IN_DAY;

	const headerHeight = DEFAULT_HEIGHT * 2;
	const headerHeightUnit = `${headerHeight}rem`;
	const rowHeight = DEFAULT_HEIGHT;
	const rowHeightUnit = `${rowHeight}rem`;
	const dataHeight = DEFAULT_DATA_HEIGHT;
	const dataHeightUnit = `${dataHeight}rem`;
	const dataTopUnit = `${(rowHeight - dataHeight) / 2}rem`;
	const totalWidthUnit = `${(endTimestamp - startTimestamp) * pxPerMs}px`;
	const totalHeightUnit = `${groups.length * DEFAULT_HEIGHT + headerHeight}rem`;

	const days = [];
	let marker = startTimestamp;
	do {
		days.push(marker);
		marker += MILLISECONDS_IN_DAY;
	} while (marker <= endTimestamp);

	const onKeyDown = (event, groupIndex, itemIndex) => {
		let nextItemIndex;
		if (event.keyCode === keycode.codes.left && itemIndex > 0) {
			nextItemIndex = itemIndex - 1;
		} else if (event.keyCode === keycode.codes.right) {
			nextItemIndex = itemIndex + 1;
		}

		if (nextItemIndex === undefined || !ref.current) {
			return;
		}
		const nextItem = ref.current.querySelector(
			`[data-group-index="${groupIndex}"] [data-item-index="${nextItemIndex}"]`,
		);
		if (nextItem) {
			nextItem.focus();
		}
	};

	return (
		<div className={theme.grid} ref={ref}>
			<div className={theme.titles} style={{ height: totalHeightUnit }}>
				<div
					role="presentation"
					className={`${theme.header} ${theme.title}`}
					style={{ height: headerHeightUnit }}
				/>
				{groups.map((group, index) => {
					const top = `${index * rowHeight + headerHeight}rem`;
					return (
						<div key={group.id} className={theme.title} style={{ top, height: rowHeightUnit }}>
							{group.label}
						</div>
					);
				})}
			</div>
			<div className={theme.rows} style={{ height: totalHeightUnit }}>
				<div
					role="presentation"
					className={`${theme.header}`}
					style={{ height: rowHeightUnit, width: totalWidthUnit }}
				>
					{days.map(day => (
						<div
							key={day}
							className={theme.day}
							style={{ width: dayLength, height: rowHeightUnit }}
						>
							{format(day, 'DD MMM', locale)}
						</div>
					))}
				</div>
				<div
					role="presentation"
					className={`${theme.header}`}
					style={{ height: rowHeightUnit, width: totalWidthUnit, top: rowHeightUnit }}
				>
					{days.map(_ =>
						HOURS.map(hour => (
							<div
								key={hour}
								className={theme.hour}
								style={{ width: dayLength / 24, height: rowHeightUnit }}
							>
								{hour}
							</div>
						)),
					)}
				</div>
				{groups.map((group, groupIndex) => {
					const top = `${groupIndex * rowHeight + headerHeight}rem`;
					return (
						<ol
							key={group.id}
							className={theme.row}
							style={{ top, height: rowHeightUnit, width: totalWidthUnit }}
							data-group-index={groupIndex}
							aria-label={group.label}
						>
							{group.items.map((item, itemIndex) => {
								const id = item[idName];
								const start = item[startName];
								const end = item[endName];
								const left = (start - timeRange[0]) * pxPerMs;
								const width = Math.max((end - start) * pxPerMs, MIN_DATA_WIDTH);
								const { className = '', style = {}, ...props } = dataItemProps(item);
								let dataBlock = (
									<button
										className={`${theme.data} ${className}`}
										style={{ ...style, left, top: dataTopUnit, height: dataHeightUnit, width }}
										onClick={() => onClick(item)}
										tabIndex={itemIndex === 0 ? 0 : -1}
										onKeyDown={event => onKeyDown(event, groupIndex, itemIndex)}
										data-item-index={itemIndex}
										{...props}
									/>
								);
								if (dataItemTooltip) {
									dataBlock = (
										<TooltipTrigger
											key={id}
											label={dataItemTooltip(item)}
											tooltipPlacement="bottom"
										>
											{dataBlock}
										</TooltipTrigger>
									);
								}
								return <li key={id}>{dataBlock}</li>;
							})}
						</ol>
					);
				})}
			</div>
		</div>
	);
}
