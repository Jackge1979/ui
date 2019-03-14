import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import theme from './Tooltip.scss';

const TooltipPropTypes = {
	id: PropTypes.string.isRequired,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
	className: PropTypes.string,
};

const TooltipHeader = ({ id, children, className }) => (
	<header id={`${id}-header`} className={classNames(className, theme.header, 'tc-tooltip-header')}>
		{children}
	</header>
);

TooltipHeader.propTypes = {
	...TooltipPropTypes,
};

const TooltipBody = ({ id, children, className }) => (
	<div id={`${id}-body`} className={classNames(theme.body, 'tc-tooltip-body')}>
		<div
			id={`${id}-body-content`}
			className={(classNames(theme.content, 'tc-tooltip-content'), className)}
		>
			{children}
		</div>
	</div>
);
TooltipBody.propTypes = {
	...TooltipPropTypes,
};

const TooltipFooter = ({ id, children, className }) => (
	<footer id={`${id}-footer`} className={classNames(className, theme.footer, 'tc-tooltip-footer')}>
		{children}
	</footer>
);

TooltipFooter.propTypes = {
	...TooltipPropTypes,
};
const Tooltip = ({ children }) => <React.Fragment>{children}</React.Fragment>;
Tooltip.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
};

Tooltip.TooltipHeader = TooltipHeader;
Tooltip.TooltipBody = TooltipBody;
Tooltip.TooltipFooter = TooltipFooter;

export default Tooltip;