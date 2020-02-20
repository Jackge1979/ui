import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import format from 'date-fns/format';
import { action } from '@storybook/addon-actions';

import IconsProvider from '../IconsProvider';
import Timeline from './Timeline.component';
import activity from './story/activity';
import getLocale from '../DateFnsLocale/locale';

export default {
	title: 'Data/Timeline',

	parameters: {
		component: Timeline,
	},
};

export function Default() {
	const { t } = useTranslation();
	const locale = useMemo(() => ({ locale: getLocale(t) }), [t]);
	return (
		<>
			<IconsProvider />
			<Timeline
				data={activity}
				idName="flowExecutionId"
				startName="startTimestamp"
				endName="finishTimestamp"
				groupIdName="flowId"
				groupLabelName="flowName"
				dataItemProps={({ flowStatus, flowName, startTimestamp, finishTimestamp }) => {
					const background =
						flowStatus === 'EXECUTION_REJECTED'
							? '#f3c446'
							: flowStatus === 'DEPLOY_FAILED' || flowStatus === 'EXECUTION_FAILED'
							? '#e96065'
							: flowStatus === 'EXECUTION_SUCCESS'
							? '#82bd41'
							: '#236192';
					const ariaLabel = `Status: ${flowStatus} - Flow name: ${flowName} - Start time: ${format(
						new Date(startTimestamp),
						'DD MMM YYYY hh:mm:ss',
						locale,
					)} - End time: ${format(new Date(finishTimestamp), 'DD MMM YYYY hh:mm:ss', locale)}`;
					return { style: { background }, 'aria-label': ariaLabel };
				}}
				dataItemTooltip={item => (
					<div>
						Status: {item.flowStatus}
						<br />
						Flow name: {item.flowName}
						<br />
						Start time: {format(new Date(item.startTimestamp), 'DD MMM YYYY hh:mm:ss', locale)}
						<br />
						End time: {format(new Date(item.finishTimestamp), 'DD MMM YYYY hh:mm:ss', locale)}
					</div>
				)}
				onClick={action('onClick')}
			>
				<Timeline.Toolbar>
					<Timeline.Zoom />
				</Timeline.Toolbar>
				<Timeline.Grid />
			</Timeline>
		</>
	);
}
