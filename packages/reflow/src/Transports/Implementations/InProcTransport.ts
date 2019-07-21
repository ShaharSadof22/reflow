import { ReflowTransport } from "../ReflowTransport";
import { ReducedViewTree, ViewerParameters } from "../../Reflow";
import { ViewInterface, ViewsMapInterface } from "../../View";

let globalInWindowTransport: InProcTransport;

export default class InProcTransport extends ReflowTransport {
	constructor(connectionOptions: object) {
		super(connectionOptions);
		// single-toning this instance,
		// so the engine and the display actually use the same object,
		// as it call's it's own methods to pass tree and events
		if (globalInWindowTransport) {
			return globalInWindowTransport;
		}
		globalInWindowTransport = this;
	}
	initializeAsEngine() {
		return Promise.resolve();
	}
	initializeAsDisplay() {
		return new Promise<InProcTransport>((resolve) => {
			this.sendViewSync();
			resolve(this);
		});
	}
	sendViewTree(tree: ReducedViewTree<ViewsMapInterface>) {
		for (const listener of this.viewStackUpdateListeners) {
			listener(JSON.parse(JSON.stringify(tree)));
		}
	}
	sendViewEvent<T extends ViewInterface, U extends keyof T["events"]>(uid: string, eventName: U, eventData: T["events"][U]): void {
		for (const listener of this.viewEventListeners) {
			listener(uid, eventName, eventData);
		}
	}
	sendViewDone<T extends ViewInterface>(uid: string, output: T["output"]): void {
		for (const listener of this.viewDoneListeners) {
			listener(uid, output);
		}
	}
	sendViewerParameters(viewerParams: ViewerParameters): void {
		for (const listener of this.viewerParametersListeners) {
			listener(viewerParams);
		}
	}
	sendViewSync() {
		for (const listener of this.viewSyncListeners) {
			listener();
		}
	}
}
