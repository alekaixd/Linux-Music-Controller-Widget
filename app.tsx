import app from "ags/gtk4/app"
import { createPoll, interval } from "ags/time"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import Gtk4LayerShell from "gi://Gtk4LayerShell"
import { exec, execAsync } from "ags/process"
import Playerctl from "gi://Playerctl?version=2.0"



function MusicPlayer() {
	const artist = createPoll("", 1000, "playerctl -p spotify metadata xesam:artist");
	const song = createPoll("", 1000, "playerctl -p spotify metadata xesam:title");
	const scriptPath = "/home/Alekai/.config/ags/scripts/GetArt.sh";
	const artUrl = createPoll("", 1000, scriptPath); // Assuming this outputs the URL; remove if it doesn't.

	const songPos = createPoll("", 500, "playerctl -p spotify position"); // Reduced interval for smoother updates.
	const songLen = createPoll("", 1000, "/home/Alekai/.config/ags/scripts/GetSongLength.sh");

	//   󰏦


	return (
		<box orientation={Gtk.Orientation.VERTICAL}>
			<box orientation={Gtk.Orientation.HORIZONTAL} hexpand={true} valign={Gtk.Align.END}>
				<image file={artUrl} pixelSize={75} />
				<box orientation={Gtk.Orientation.VERTICAL} hexpand={true} halign={Gtk.Align.FILL}>
					<box orientation={Gtk.Orientation.HORIZONTAL}
						halign={Gtk.Align.START}
						hexpand={true}
						class={"button-holder"}>
						<button
							class={"mButton"}
							halign={Gtk.Align.END}
							valign={Gtk.Align.START}
							onClicked={() => {
								execAsync("playerctl -p spotify previous")
									.then(() => print("Toggled play/pause"))
									.catch((err) => print(`Error: ${err}`));
							}}>
							<label label={"󰙤"} />
						</button>

						<button
							class={"mButton"}
							halign={Gtk.Align.END}
							valign={Gtk.Align.START}
							onClicked={() => {
								execAsync("playerctl -p spotify play-pause")
									.then(() => print("Toggled play/pause"))
									.catch((err) => print(`Error: ${err}`));
							}}>
							<label label={""} />
						</button>
						<button
							class={"mButton"}
							halign={Gtk.Align.END}
							valign={Gtk.Align.START}
							onClicked={() => {
								execAsync("playerctl -p spotify next")
									.then(() => print("Toggled play/pause"))
									.catch((err) => print(`Error: ${err}`));
							}}>
							<label label={"󰙢"} />
						</button>

					</box>
					<box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.END} class={"label-box"}>
						<label label={artist} visible halign={Gtk.Align.START} class={"artist"} wrap={true} />
						<label label={song} visible halign={Gtk.Align.START} class={"meta-text"} wrap={true} />
					</box>
				</box>
			</box>
			<slider
				class={"music-slider"}
				value={songPos}
				min={0}
				max={songLen}
				onChangeValue={({ value }: { value: number }) => {
					execAsync(`playerctl -p spotify position ${value}`)
						.then(() => print(`Set Spotify position to ${value}`))
						.catch((err) => print(`Error: ${err}`));
				}}
			/>
		</box>
	);
}
class draggable {
	private window: Gtk.Window;
	private grabOffsetX: number = 0; // Offset of click within widget (x)
	private grabOffsetY: number = 0; // Offset of click within widget (y)

	constructor() {
		this.window = new Gtk.Window({
			name: "music-player",
			default_width: 250,
			default_height: 100,
			decorated: false,
			resizable: false,
		});

		const cssProvider = new Gtk.CssProvider();
		cssProvider.load_from_path('./style.css');

		const display = Gdk.Display.get_default();
		if (display) {
			Gtk.StyleContext.add_provider_for_display(display, cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
		}

		const styleContext = this.window.get_style_context();
		styleContext.add_class("music-player")

		Gtk4LayerShell.init_for_window(this.window);
		Gtk4LayerShell.set_layer(this.window, Gtk4LayerShell.Layer.OVERLAY);
		Gtk4LayerShell.set_anchor(this.window, Gtk4LayerShell.Edge.TOP, true);
		Gtk4LayerShell.set_anchor(this.window, Gtk4LayerShell.Edge.LEFT, true);

		const contentWidget = MusicPlayer();
		this.window.set_child(contentWidget);
		this.window.show();

		const dragGesture = new Gtk.GestureDrag();
		this.window.add_controller(dragGesture);
		dragGesture.connect("drag-begin", this.onDragBegin.bind(this));
		dragGesture.connect("drag-update", this.onDragUpdate.bind(this));
	}

	private onDragBegin(_gesture: Gtk.GestureDrag) {
		// Get the starting point of the drag (relative to the widget)
		const [success, startX, startY] = _gesture.get_start_point();
		if (!success) {
			print("Failed to get drag start point");
			return;
		}

		// Store the offset of the click within the widget
		this.grabOffsetX = startX;
		this.grabOffsetY = startY;

	}

	private onDragUpdate(_gesture: Gtk.GestureDrag) {
		// Get the current drag offset (relative to the start point)
		const [success, offsetX, offsetY] = _gesture.get_offset();
		if (!success) {
			print("Failed to get drag offset");
			return;
		}

		// Get the current window position (margins set by layer shell)
		const winX = Gtk4LayerShell.get_margin(this.window, Gtk4LayerShell.Edge.LEFT);
		const winY = Gtk4LayerShell.get_margin(this.window, Gtk4LayerShell.Edge.TOP);

		// Calculate new window position
		// The new position is the initial window position + drag offset - click offset within widget
		const newX = winX + offsetX;
		const newY = winY + offsetY;

		// Update the window's position
		Gtk4LayerShell.set_margin(this.window, Gtk4LayerShell.Edge.LEFT, newX);
		Gtk4LayerShell.set_margin(this.window, Gtk4LayerShell.Edge.TOP, newY);
	}
}

app.start({
	main() {
		print("started...")
		new draggable();
	},
})
