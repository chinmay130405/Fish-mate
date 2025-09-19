// Ensure all 2D canvas contexts request willReadFrequently for better getImageData performance
(() => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (
    contextId: string,
    options?: any
  ): any {
    if (contextId === '2d') {
      const merged = { ...(options || {}), willReadFrequently: true }
      return originalGetContext.call(this, contextId, merged)
    }
    return originalGetContext.call(this, contextId, options)
  }
})()


