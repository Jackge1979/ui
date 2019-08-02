import React from 'react';
import { storiesOf } from '@storybook/react';

import Loader from '../src/Loader';
import { CIRCULAR_PROGRESS_SIZE as SIZE } from '../src/constants';

const containerStyle = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: '100vh',
	width: '100vw',
};

const decoratedStories = storiesOf('Legacy/Loader', module).addDecorator(story => (
	<div style={containerStyle}>{story()}</div>
));

decoratedStories
	.add('default', () => <Loader />)
	.add('small', () => <Loader size={SIZE.small} />)
	.add('large', () => <Loader size={SIZE.large} />);
