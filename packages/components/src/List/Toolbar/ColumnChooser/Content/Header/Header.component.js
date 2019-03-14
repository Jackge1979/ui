import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import theme from '../ColumnChooser.scss';
import { columnChooserContext } from '../columnChooser.context';
import Tooltip from '../../TooltipCompound';

const Title = props => {
	const { t } = useContext(columnChooserContext);
	if (props.value) {
		return props.value;
	}
	return t('COLUMN_CHOOSER_HEADER_TITLE', {
		defaultValue: 'Modify columns position',
	});
};

const ColumnChooserHeader = ({ className, children }) => {
	return (
		<Tooltip.TooltipHeader
			className={classNames(
				className,
				theme['tc-column-chooser-header'],
				'tc-column-chooser-header',
			)}
		>
			{!children ? <Title /> : children}
		</Tooltip.TooltipHeader>
	);
};

ColumnChooserHeader.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
	className: PropTypes.string,
};

ColumnChooserHeader.Title = Title;

export default ColumnChooserHeader;