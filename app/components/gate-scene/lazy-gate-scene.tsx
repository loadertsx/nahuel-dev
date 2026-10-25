import {
	Component,
	lazy,
	type ReactNode,
	Suspense,
	useEffect,
	useState,
} from "react";
import { TransmutationCircle } from "~/components/alchemy/glyphs";

// three.js needs the DOM: the scene is only ever loaded in the browser.
// Keeping the import out of the server bundle entirely matters: if the SSR
// build sees it, React Router's server-build module gets merged into a
// shared chunk and the build can no longer find it.
const GateScene = import.meta.env.SSR
	? null
	: lazy(() => import("./gate-scene"));

/**
 * WebGL can be missing or fail to start (old GPUs, disabled acceleration,
 * lost contexts). Suspense only covers loading, so without this the error
 * would reach the route boundary and take the whole page down.
 */
class SceneBoundary extends Component<
	{ fallback: ReactNode; children: ReactNode },
	{ failed: boolean }
> {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	render() {
		return this.state.failed ? this.props.fallback : this.props.children;
	}
}

/**
 * The Gate of Truth, safe to render anywhere: on the server and while the
 * 3D bundle loads (or if it fails) it shows the static transmutation circle
 * in its place.
 */
export function LazyGateScene({
	className,
	orbit,
}: {
	className?: string;
	orbit?: number;
}) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const fallback = (
		<div className={className}>
			<TransmutationCircle className="size-full p-[8%]" />
		</div>
	);
	if (!mounted || !GateScene) return fallback;
	return (
		<SceneBoundary fallback={fallback}>
			<Suspense fallback={fallback}>
				<GateScene className={className} orbit={orbit} />
			</Suspense>
		</SceneBoundary>
	);
}
