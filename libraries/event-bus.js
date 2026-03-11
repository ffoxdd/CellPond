//===========//
// EVENT BUS //
//===========//
class EventBus {
	constructor() {
		this._listeners = {}
	}

	on(event, fn) {
		(this._listeners[event] ??= []).push(fn)
	}

	off(event, fn) {
		const list = this._listeners[event]
		if (!list) return
		const i = list.indexOf(fn)
		if (i !== -1) list.splice(i, 1)
	}

	emit(event, ...args) {
		for (const fn of this._listeners[event] ?? []) {
			fn(...args)
		}
	}
}
