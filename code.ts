figma.showUI(__html__, { width: 500, height: 400 });

console.clear();
const rgba = figma.util.rgba


figma.ui.onmessage = msg => {

  if (msg.type === 'generate') {
    const jsonObject = JSON.parse(msg.data);

    for (let theme in jsonObject) {
      console.log(`🎨 ${theme}`)
      const collection = figma.variables.createVariableCollection(theme);

      if (jsonObject.hasOwnProperty(theme)) {

        for (let variable in jsonObject[theme]) {
          console.log(`💎 ${variable}`)



          if (jsonObject[theme].hasOwnProperty(variable)) {

            let modes = jsonObject[theme][variable]
            let count = 0

            const variableItem = figma.variables.createVariable(
              variable,
              collection.id,
              "COLOR"
            )

            for (let mode in modes) {

              // // rename first mode
              console.log(collection.modes)
              if (count == 0) {
                console.log('✨ Renaming first mode')
                let currentModeId = collection.modes[count].modeId
                collection.renameMode(currentModeId, mode)
                variableItem.setValueForMode(currentModeId, rgba(modes[mode]))
              }

              // // add new mode
              console.log(`Count is ${count}`)
              if (!collection.modes[count]) {
                console.log('✨ Adding mode')
                collection.addMode(mode)

              }

              let currentModeId = collection.modes[count].modeId
              variableItem.setValueForMode(currentModeId, rgba(modes[mode]))

              console.log(`↳ 🌓 ${mode}: ${modes[mode]}`)
              count++
            }
          }
        }
      }
    }

  }
}

// Remove the existing hexToRgb function
// Replace it with the updated code block
function hexToRgb(hex: string): { r: number, g: number, b: number, a: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  return result ? {
    r: Math.round(parseInt(result[1], 16) / 2.55) / 100,
    g: Math.round(parseInt(result[2], 16) / 2.55) / 100,
    b: Math.round(parseInt(result[3], 16) / 2.55) / 100,
    a: result[4] ? Math.round(parseInt(result[4], 16) / 2.55) / 100 : 1
  } : null;
}