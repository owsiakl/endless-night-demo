import {Assets} from "./Core/Assets";
import {EndlessNight} from "./Game/EndlessNight";
import {WindowDecorator} from "./Core/WindowDecorator";
import {WebGL2Renderer} from "./Renderer/WebGL2Renderer";
import {DebugContainer} from "./Debug/DebugContainer";

window.addEventListener('error', error => alert(error.message));

const windowDecorator = new WindowDecorator(window);
const debug = windowDecorator.debug ? DebugContainer.create(windowDecorator) : null;
const assets = new Assets();
const renderer = new WebGL2Renderer(windowDecorator, assets, debug);
const game = new EndlessNight(windowDecorator, assets, renderer, debug);

assets.importShader('default_vertex', 'shader/default/vertex.glsl');
assets.importShader('default_fragment', 'shader/default/fragment.glsl');
assets.importShader('depth_vertex', 'shader/depth/vertex.glsl');
assets.importShader('depth_fragment', 'shader/depth/fragment.glsl');
assets.importShader('fire_vertex', 'shader/particle/fire/vertex.glsl');
assets.importShader('fire_fragment', 'shader/particle/fire/fragment.glsl');

assets.importImage('ground', 'image/ground.jpg');
assets.importImage('ground_normal', 'image/ground_normal.jpg');

assets.importBinaryModel('akai', 'model/akai.glb');
assets.importBinaryModel('torch', 'model/torch.glb');

windowDecorator.addEventListener('DOMContentLoaded', () => {
    assets.load(() => {
        game.bootstrap();
        windowDecorator.body.classList.add('initialized');
    });
});
