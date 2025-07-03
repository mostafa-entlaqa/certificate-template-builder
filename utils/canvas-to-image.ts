export const generateCanvasPreview = (
  elements: any[],
  canvasSize: { width: number; height: number },
  testData?: {
    student_name: string
    course_name: string
    completion_date: string
    instructor_name: string
    grade: string
  },
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    // Set canvas size
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    // Set white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Sort elements by zIndex
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex)

    let loadedImages = 0
    const totalImages = sortedElements.filter((el) => el.type === "image").length

    const drawElement = (element: any) => {
      ctx.save()

      if (element.type === "text") {
        // Get content and replace dynamic fields if testData is provided
        let content = element.content || ""
        if (testData) {
          content = content
            .replace(/\{\{student_name\}\}/g, testData.student_name)
            .replace(/\{\{course_name\}\}/g, testData.course_name)
            .replace(/\{\{completion_date\}\}/g, testData.completion_date)
            .replace(/\{\{instructor_name\}\}/g, testData.instructor_name)
            .replace(/\{\{grade\}\}/g, testData.grade)
        }

        // Draw text
        ctx.fillStyle = element.color || "#000000"
        ctx.font = `${element.fontWeight || "normal"} ${element.fontSize || 16}px ${element.fontFamily || "Arial"}`

        // Handle text alignment
        let textAlign: CanvasTextAlign = "center"
        let x = element.x + element.width / 2

        if (element.textAlign === "left") {
          textAlign = "left"
          x = element.x + 8
        } else if (element.textAlign === "right") {
          textAlign = "right"
          x = element.x + element.width - 8
        }

        ctx.textAlign = textAlign
        ctx.textBaseline = "middle"

        // Draw background if exists
        if (element.backgroundColor && element.backgroundColor !== "transparent") {
          ctx.fillStyle = element.backgroundColor
          ctx.fillRect(element.x, element.y, element.width, element.height)
          ctx.fillStyle = element.color || "#000000"
        }

        ctx.fillText(content, x, element.y + element.height / 2)
      } else if (element.type === "shape") {
        // Draw shape
        ctx.fillStyle = element.backgroundColor || "#000000"

        if (element.shapeType === "circle") {
          ctx.beginPath()
          ctx.arc(
            element.x + element.width / 2,
            element.y + element.height / 2,
            Math.min(element.width, element.height) / 2,
            0,
            2 * Math.PI,
          )
          ctx.fill()
        } else if (element.shapeType === "star") {
          // Draw star shape (simplified)
          const centerX = element.x + element.width / 2
          const centerY = element.y + element.height / 2
          const outerRadius = Math.min(element.width, element.height) / 2
          const innerRadius = outerRadius * 0.4

          ctx.beginPath()
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const x = centerX + Math.cos(angle - Math.PI / 2) * radius
            const y = centerY + Math.sin(angle - Math.PI / 2) * radius
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.fill()
        } else {
          // Rectangle
          ctx.fillRect(element.x, element.y, element.width, element.height)
        }

        // Draw border if exists
        if (element.borderWidth && element.borderColor) {
          ctx.strokeStyle = element.borderColor
          ctx.lineWidth = element.borderWidth
          ctx.strokeRect(element.x, element.y, element.width, element.height)
        }
      }

      ctx.restore()
    }

    const finishDrawing = () => {
      // Draw all non-image elements
      sortedElements.forEach((element) => {
        if (element.type !== "image") {
          drawElement(element)
        }
      })

      // Convert to data URL
      const dataURL = canvas.toDataURL("image/png", 0.8)
      resolve(dataURL)
    }

    if (totalImages === 0) {
      finishDrawing()
    } else {
      // Load and draw images
      sortedElements.forEach((element) => {
        if (element.type === "image" && element.imageUrl) {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            ctx.drawImage(img, element.x, element.y, element.width, element.height)
            loadedImages++
            if (loadedImages === totalImages) {
              finishDrawing()
            }
          }
          img.onerror = () => {
            loadedImages++
            if (loadedImages === totalImages) {
              finishDrawing()
            }
          }
          img.src = element.imageUrl
        }
      })
    }
  })
}
