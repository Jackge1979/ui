import React, { Component } from 'react';
import renderer from 'react-test-renderer';
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import Mapping from './Mapping.js';
import MappingConfiguration from './MappingConfiguration.js';
import MappingSVG from './MappingSVG.js';
import MappingActions from './MappingActions.js';
import * as Constants from '../Constants';

const mappingConfig = new MappingConfiguration(MappingSVG, MappingActions);

const preferences = {
	showAll: false,
};

const elem_in_1 = {
	id: 'in_1',
	name: 'elem_in_1',
	type: 'string',
	description: 'bla bla bla',
};

const elem_in_2 = {
	id: 'in_2',
	name: 'elem_in_2',
	type: 'string',
	description: 'bla bla bla',
};

const elem_out_1 = {
	id: 'out_1',
	name: 'elem_out_1',
	type: 'string',
	description: 'bla bla bla',
};

const elem_out_2 = {
	id: 'out_2',
	name: 'elem_out_2',
	type: 'string',
	description: 'bla bla bla',
};

const singleConnection = {
	all: [
		{
			sourceYPos: 15,
			targetYPos: 40,
			key: 'in_1-out_2',
			visibility: Constants.Connection.VISIBILITY.FULL,
		},
	],
};

const anchors1 = {
	unmapped: {
		input: [
			{
				yPos: 15,
				key: 'in_1',
			},
			{
				yPos: 40,
				key: 'in_2',
			},
		],
		output: [
			{
				yPos: 15,
				key: 'out_1',
			},
			{
				yPos: 40,
				key: 'out_2',
			},
		],
	},
};

const anchors2 = {
	unmapped: {
		input: [
			{
				yPos: 40,
				key: 'in_2',
			},
		],
		output: [
			{
				yPos: 15,
				key: 'out_1',
			},
		],
	},
	mapped: {
		input: [
			{
				yPos: 15,
				key: 'in_1',
			},
		],
		output: [
			{
				yPos: 40,
				key: 'out_2',
			},
		],
	},
};

/**
 * Wraps a component into a DragDropContext that uses the TestBackend.
 */
function wrapInTestContext(DecoratedComponent) {
	return DragDropContext(TestBackend)(
		class TestContextContainer extends Component {
			render() {
				return <DecoratedComponent {...this.props} />;
			}
		},
	);
}

it('no connections - no anchors', () => {
	const getConnections = jest.fn().mockReturnValue({});
	const getAnchors = jest.fn().mockReturnValue({});
	const MappingTestContext = wrapInTestContext(Mapping);
	// create React tree
	const tree = renderer
		.create(
			<MappingTestContext
				mappingConfiguration={mappingConfig}
				preferences={preferences}
				getConnections={getConnections}
				getAnchors={getAnchors}
			/>,
		)
		.toJSON();
	expect(tree).toMatchSnapshot();
});

it('no connections - unmapped anchors', () => {
	const getConnections = jest.fn().mockReturnValue({});
	const getAnchors = jest.fn().mockReturnValue(anchors1);
	const MappingTestContext = wrapInTestContext(Mapping);
	// create React tree
	const tree = renderer
		.create(
			<MappingTestContext
				mappingConfiguration={mappingConfig}
				preferences={preferences}
				getConnections={getConnections}
				getAnchors={getAnchors}
			/>,
		)
		.toJSON();
	expect(tree).toMatchSnapshot();
});

it('single connection [all] - no anchors', () => {
	const getConnections = jest.fn().mockReturnValue(singleConnection);
	const getAnchors = jest.fn().mockReturnValue({});
	const MappingTestContext = wrapInTestContext(Mapping);
	// create React tree
	const tree = renderer
		.create(
			<MappingTestContext
				mappingConfiguration={mappingConfig}
				preferences={preferences}
				getConnections={getConnections}
				getAnchors={getAnchors}
			/>,
		)
		.toJSON();
	expect(tree).toMatchSnapshot();
});

it('single connection [all] - mapped/unmapped anchors', () => {
	const getConnections = jest.fn().mockReturnValue(singleConnection);
	const getAnchors = jest.fn().mockReturnValue(anchors2);
	const MappingTestContext = wrapInTestContext(Mapping);
	// create React tree
	const tree = renderer
		.create(
			<MappingTestContext
				mappingConfiguration={mappingConfig}
				preferences={preferences}
				getConnections={getConnections}
				getAnchors={getAnchors}
			/>,
		)
		.toJSON();
	expect(tree).toMatchSnapshot();
});
