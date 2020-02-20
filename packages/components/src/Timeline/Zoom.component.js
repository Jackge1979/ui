import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTimelineContext } from './context';
import Icon from '../Icon';

export default function Zoom({ initialZoom, min = 0.5, max = 2 }) {
	const { setZoom, zoom } = useTimelineContext();

	useEffect(() => {
		if (initialZoom) {
			setZoom(initialZoom);
		}
	}, []);

	const zoomOut = () => {
		if (zoom >= min) {
			setZoom(zoom - 0.1);
		}
	};

	const zoomIn = () => {
		if (zoom <= max) {
			setZoom(zoom + 0.1);
		}
	};

	return (
		<>
			<Icon name="talend-minus-circle" onClick={zoomOut} aria-label="Zoom out" />
			<Icon name="talend-plus-circle" onClick={zoomIn} aria-label="Zoom in" />
		</>
	);
}
