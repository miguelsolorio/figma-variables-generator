figma.showUI(__html__, { themeColors: true, width: 450, height: 400 });

console.clear();
const rgba = figma.util.rgba

let currentCollectionsDictionary: { name: string; id: string; }[] = []
let currentCollections = figma.variables.getLocalVariableCollections();

currentCollections.forEach((collections) => {
  console.log(`📦 ${collections.name}`)
  currentCollectionsDictionary.push({ name: collections.name, id: collections.id })
});

figma.ui.postMessage({ type: 'currentCollections', data: currentCollectionsDictionary })


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

        let collection: VariableCollection
        if(msg.collection !== 'default'){
          collection = figma.variables.getVariableCollectionById(msg.collection) as VariableCollection;
          console.log(`Existing Collection is ${collection.name}`)
          console.log(collection)
        } else {
          collection = figma.variables.createVariableCollection(theme);
        }

        if (jsonObject.hasOwnProperty(theme)) {

          for (let variable in jsonObject[theme]) {
            console.log(`💎 ${variable}`)

            if (jsonObject[theme].hasOwnProperty(variable)) {

              // if variable only has a single mode, add it to the default mode
              let modes = jsonObject[theme][variable]
              if (typeof modes !== 'object') {
                console.log('✨ Adding to default mode');
                let mode = Object.keys(jsonObject);
                let color = rgba(jsonObject[theme][variable]);
                let defaultMode = collection.modes[0].modeId;
                const variableItem = figma.variables.createVariable(
                  variable,
                  collection.id,
                  "COLOR"
                );
                variableItem.setValueForMode(defaultMode, color);
              }

              // if variables has multiple modes, add them to the collection and rename modes
              else {

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