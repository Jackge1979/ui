import { put, select, takeEvery } from 'redux-saga/effects';
import objectId from 'bson-objectid';
import Notification from './Notification.connect';
import Constants from './Notification.constant';

const DEFAULT_COMPONENT_ID = 'Notification';

export function* onPushNotification(action) {
	const componentState = yield select(state => Notification.getState(state, DEFAULT_COMPONENT_ID));
	const newComponentState = componentState.updateIn(['notifications'], notifications =>
		notifications.push({
			id: objectId(),
			...action.notification,
		})
	);
	const updateStateAction = Notification.setStateAction(
		newComponentState,
		DEFAULT_COMPONENT_ID,
	);

	yield put(updateStateAction);
}

function* defaultHandler() {
	yield takeEvery(Constants.PUSH_NOTIFICATION, onPushNotification);
}

export default {
	'Notification#root': defaultHandler,
};
