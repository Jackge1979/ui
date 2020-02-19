import React from 'react';
import Timeline from './Timeline.component';
import activity from './story/activity';

export default {
	title: 'Data/Timeline',

	parameters: {
		component: Timeline,
	},
};

export function Default() {
	return (
		<Timeline
			data={activity}
			startName="startTimestamp"
			endName="finishTimestamp"
			groupIdName="flowId"
			groupLabelName="flowName"
		>
			<Timeline.Grid />
		</Timeline>
	);
}
