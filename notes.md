

gump + webgl notes
==================

must have

- pixel (fragment?) shader transforming world state, int texture to int texture
- frame renderer that takes above output as "texture lookup?" and somehow draws my little rectangles in clip space

nice to have

- another "compute" shader that takes the world state as lookup texture and maps to a signal processed version.
   - would need its own texture to keep state around, kinda like the transparency layer does in my processing version.
   - could be low pass, band pass, whatever.  each could use the same frame rendererer.
   - fft would be possible maybe but i'd need history ring structure for that (i.e. 3D texture).  if that's even possible, it might make more sense to have that in the world state shader.  the output would be a window-sized array of coefficients per pixel, which would be pretty cool to render as a voxel cube thing.
- yet another "compute" shader takes the world state as lookup texture, and maps to an octree shaped aggregator (i.e. a convolution-style counter per octree level) to count population.  not sure the best way to "extract" that population number to javascript land


From https://webgl2fundamentals.org
===================================

Functions like gl.createBuffer, gl.bufferData, gl.createTexture, and gl.texImage2D let you upload data to buffers (vertex data) and data to textures (color, etc..). gl.createProgram, gl.createShader, gl.compileProgram, and gl.linkProgram let you create your GLSL shaders. Nearly all the rest of the functions of WebGL are setting up these global variables or state that is used when gl.drawArrays or gl.drawElements is finally called.

Knowing this a typical WebGL program basically follows this structure:

At Init time

- create all shaders and programs and look up locations
- create buffers and upload vertex data
- create a vertex array for each thing you want to draw
   - for each attribute call gl.bindBuffer, gl.vertexAttribPointer, gl.enableVertexAttribArray
   - bind any indices to gl.ELEMENT_ARRAY_BUFFER
- create textures and upload texture data

At Render Time

- clear and set the viewport and other global state (enable depth testing, turn on culling, etc..)
- For each thing you want to draw
   - call gl.useProgram for the program needed to draw.
   - bind the vertex array for that thing.
      - call gl.bindVertexArray
   - setup uniforms for the thing you want to draw
      - call gl.uniformXXX for each uniform
      - call gl.activeTexture and gl.bindTexture to assign textures to texture units.
   - call gl.drawArrays or gl.drawElements

From https://nullprogram.com/blog/2014/06/10/
=============================================

A framebuffer is the target of the current glClear(), glDrawArrays(), or glDrawElements(). The user’s display is the default framebuffer. New framebuffers can be created and used as drawing targets in place of the default framebuffer. This is how things are drawn off-screen without effecting the display.