figma.showUI(__html__, { themeColors: true, width: 450, height: 400 });

console.clear();
const rgba = figma.util.rgba


figma.ui.onmessage = msg => {

  if (msg.type === 'generate') {

    // validate JSON
    try {
      JSON.parse(msg.data);
    } catch (e) {
      console.error('msg.data is not valid JSON');
      figma.notify('🚨 Error: Your JSON is not valid', {
        button: {
          text: 'Validate JSON',
          action: () => {
            figma.ui.postMessage({ type: 'openURL', url: `https://jsonlint.com/?json=${encodeURIComponent(msg.data)}` })
          }
        }
      })
      return
    }

    const jsonObject = JSON.parse(msg.data);
    try {
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

                // rename first mode
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
        figma.notify(`✅ Generated ${collection.name} collection with ${collection.variableIds.length} variables`)
      }
    } catch (error: any) {
      let message = error.message

      if (message === 'in addMode: Limited to 1 modes only') {
        figma.notify(`🚨 Error: Your Figma license only allows 1 mode`)
      } else {
        figma.notify(`🚨 Error: ${message}`)
      }

      console.log(error)

    }

  }
}