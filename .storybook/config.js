import '@talend/bootstrap-theme/src/theme/theme.scss';
import 'focus-outline-manager';
import 'storybook-chroma';
import { load, addDecorator, addParameters } from '@storybook/react';
import { withA11y } from '@storybook/addon-a11y';
import { DocsPage } from '@storybook/addon-docs/blocks';

import './i18n';

addDecorator(withA11y);

addParameters({
	docs: DocsPage,
});

// automatically import all files ending in *.stories.js
load(require.context('../packages/components/stories', true, /\.stories\.js$/), module);
load(require.context('../packages/datagrid/stories', true, /\.stories\.js$/), module);
