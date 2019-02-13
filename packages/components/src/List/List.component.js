import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';

import Toolbar from './Toolbar';
import ListToVirtualizedList from './ListToVirtualizedList';
import theme from './List.scss';
import Inject from '../Inject';

function ListToolbar({
	id,
	columnChooser,
	toolbar,
	displayMode,
	list,
	getComponent,
	components = {},
}) {
	if (!toolbar) {
		return null;
	}
	const shouldHideSortOptions = !!(displayMode === 'table' && list.sort);
	const toolbarProps = {
		...toolbar,
		id,
		columnChooser,
		getComponent,
		components,
	};

	if (toolbar.display) {
		toolbarProps.display.mode = displayMode;
	}

	if (list.itemProps && list.itemProps.isSelected && list.itemProps.onToggleAll) {
		toolbarProps.selectAllCheckbox = {
			id,
			items: list.items,
			isSelected: list.itemProps.isSelected,
			onToggleAll: list.itemProps.onToggleAll,
		};
	}
	return <Toolbar {...toolbarProps} sort={!shouldHideSortOptions && toolbarProps.sort} />;
}

ListToolbar.propTypes = {
	id: PropTypes.string,
	displayMode: PropTypes.string,
	list: PropTypes.shape({
		items: PropTypes.arrayOf(PropTypes.object),
		itemProps: PropTypes.shape({
			classNameKey: PropTypes.string,
			isActive: PropTypes.func,
			isSelected: PropTypes.func,
			onRowClick: PropTypes.func,
			onSelect: PropTypes.func,
			onToggle: PropTypes.func,
			onToggleAll: PropTypes.func,
			width: PropTypes.string,
		}),
		sort: PropTypes.shape({
			field: PropTypes.string,
			isDescending: PropTypes.bool,
			onChange: PropTypes.func.isRequired,
		}),
	}),
	toolbar: PropTypes.shape(omit(Toolbar.propTypes, 't')),
	columnChooser: PropTypes.shape({
		handlerColumnChooser: PropTypes.func.isRequired,
		columns: PropTypes.array.isRequired,
	}),
};

/**
 * @param {object} props react props
 * @example
 const props = {
	displayMode: 'table' / 'large'
	list: {
		items: [{}, {}, ...],
		columns: [
			{key, label},
			{key, label},
		]
	},
	toolbar: {
		display: {
			onChange: function,
		},
		sort: {
			field: key,
			options: [
				{key, label},
			],
			isDescending: true / false,
			onChange: function,
		},
		pagination: {
			onChange: function,
			itemsLength: number,
		},
		filter: {
			onFilter: function,
		},
	}
}
 <List {...props}></List>
 */
class List extends React.Component {
	static displayName = 'List';

	static propTypes = {
		...ListToolbar.propTypes,
	};

	static defaultProps = {
		displayMode: 'table',
	};

	render() {
		const {
			columnChooser,
			components = {},
			defaultHeight,
			displayMode,
			getComponent,
			id,
			list,
			rowHeight,
			rowRenderers,
			toolbar,
		} = this.props;

		const classnames = classNames('tc-list', theme.list);
		const injected = Inject.all(getComponent, omit(components, ['toolbar', 'list']));
		return (
			<div className={classnames}>
				{injected('before-component')}
				{injected('before-toolbar')}
				<ListToolbar
					id={id}
					toolbar={toolbar}
					displayMode={displayMode}
					list={list}
					columnChooser={columnChooser}
					getComponent={getComponent}
					components={components}
				/>
				{injected('after-toolbar')}
				{injected('before-list-wrapper')}
				<div className={'tc-list-display-virtualized'}>
					{injected('before-list')}
					<ListToVirtualizedList
						id={id}
						displayMode={displayMode}
						defaultHeight={defaultHeight}
						rowHeight={rowHeight}
						getComponent={getComponent}
						rowRenderers={rowRenderers}
						{...list}
					/>
					{injected('after-list')}
				</div>
				{injected('after-list-wrapper')}
				{injected('after-component')}
			</div>
		);
	}
}

export default List;
