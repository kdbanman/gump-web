#version 300 es

precision mediump float;

uniform sampler2D state;
uniform vec2 environmentSize;

out vec4 outColor;


int getState(vec2 offset) {
    return int(texture(state, (gl_FragCoord.xy + offset) / environmentSize).r);
}

bool isHorizontalCell() {
    return int(floor(gl_FragCoord.x)) % 2 == 1 && int(floor(gl_FragCoord.y)) % 2 == 0;
}

bool isVerticalCell() {
    return int(floor(gl_FragCoord.x)) % 2 == 0 && int(floor(gl_FragCoord.y)) % 2 == 1;
}

void main() {
    int liveNeighbors;

    if (isHorizontalCell()) {
        liveNeighbors =
            getState(vec2(-1.0, -1.0)) +
            getState(vec2(-1.0,  1.0)) +
            getState(vec2( 1.0,  1.0)) +
            getState(vec2( 1.0, -1.0)) +
            getState(vec2(-2.0,  0.0)) +
            getState(vec2( 2.0,  0.0));
    } else if (isVerticalCell()) {
        liveNeighbors =
            getState(vec2(-1.0, -1.0)) +
            getState(vec2(-1.0,  1.0)) +
            getState(vec2( 1.0,  1.0)) +
            getState(vec2( 1.0, -1.0)) +
            getState(vec2( 0.0, -2.0)) +
            getState(vec2( 0.0,  2.0));
    }

    if (liveNeighbors == 3 || liveNeighbors == 4) {
        outColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else if (liveNeighbors == 1 || liveNeighbors == 2) {
        float current = float(getState(vec2(0.0, 0.0)));
        outColor = vec4(current, current, current, 1.0);
    } else {
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}