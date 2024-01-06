figma.showUI(__html__, { themeColors: true, width: 350, height: 500 });

console.clear();
const rgba = figma.util.rgba

let currentCollectionsDictionary: { name: string; id: string; }[] = []
let currentCollections


function getcurrentCollections() {
  currentCollectionsDictionary = [] // clear collections
  currentCollections = figma.variables.getLocalVariableCollections();
  currentCollections.forEach((collections) => {
    currentCollectionsDictionary.push({ name: collections.name, id: collections.id })
  });
  console.log(`📦 Current Collections:`)
  console.log(currentCollectionsDictionary)
}
getcurrentCollections()

figma.ui.postMessage({ type: 'currentCollections', data: currentCollectionsDictionary })


figma.ui.onmessage = msg => {

  if (msg.action === 'generate') {

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
    const theme = msg.collection;
    let generatedVariables = 0

    let collection: VariableCollection
    if (msg.type == 'existing') {
      collection = figma.variables.getVariableCollectionById(msg.collection) as VariableCollection;
      console.log(`Existing Collection is ${collection.name}`)
      console.log(collection)
    } else {
      collection = figma.variables.createVariableCollection(theme);
    }

    try {
      for (let variable in jsonObject) {
        console.log(`💎 ${variable}`)

        if (jsonObject.hasOwnProperty(variable)) {

          // if variable only has a single mode, add it to the default mode
          let modes = jsonObject[variable]
          let colorRaw = jsonObject[variable];

          if (typeof modes !== 'object') {
            console.log('✨ Adding to default mode');
            let mode = Object.keys(jsonObject);
            let color: RGBA

            // Aliasing
            if (colorRaw.startsWith('$')) {
              let aliasName = colorRaw.split('$').pop();
              console.log(`👽 Attempting to find alias ${aliasName}`)
              let getVariables = figma.variables.getLocalVariables();
              let foundVariable = getVariables.find(variable => variable.name === aliasName);

              // Check if the alias was found
              if (foundVariable) {
                console.log("Found variable is", foundVariable);

                let defaultMode = collection.modes[0].modeId;
                const variableItem = figma.variables.createVariable(
                  variable,
                  collection.id,
                  "COLOR"
                );
                variableItem.setValueForMode(defaultMode, {
                  type: 'VARIABLE_ALIAS',
                  id: foundVariable.id
                });
              } else {
                console.log(`🚨 Error: Variable ${aliasName} not found`);
                figma.notify(`🚨 Error: Variable $${aliasName} not found`)
              }

            } else {
              color = rgba(jsonObject[variable]);
              let defaultMode = collection.modes[0].modeId;
              const variableItem = figma.variables.createVariable(
                variable,
                collection.id,
                "COLOR"
              );
              variableItem.setValueForMode(defaultMode, color);
            }
          }

          // if variables has multiple modes, add them to the collection and rename modes
          else {

            let modes = jsonObject[variable]
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
                if (modes[mode].startsWith('$')) {
                  let aliasName = modes[mode].split('$').pop();
                  let getVariables = figma.variables.getLocalVariables();
                  let foundVariable = getVariables.find(variable => variable.name === aliasName);

                  // Check if the alias was found
                  if (foundVariable) {
                    console.log("Found variable is", foundVariable);

                    let defaultMode = collection.modes[0].modeId;
                    variableItem.setValueForMode(defaultMode, {
                      type: 'VARIABLE_ALIAS',
                      id: foundVariable.id
                    });
                  } else {
                    console.log(`🚨 Error: Variable ${aliasName} not found`);
                    figma.notify(`🚨 Error: Variable $${aliasName} not found`)
                  }
                } else {
                  variableItem.setValueForMode(currentModeId, rgba(modes[mode]))
                }
              }

              // add new mode
              console.log(`Count is ${count}`)
              if (!collection.modes[count]) {
                console.log('✨ Adding mode')
                collection.addMode(mode)
              }

              let currentModeId = collection.modes[count].modeId
              if (modes[mode].startsWith('$')) {
                let aliasName = modes[mode].split('$').pop();
                let getVariables = figma.variables.getLocalVariables();
                let foundVariable = getVariables.find(variable => variable.name === aliasName);

                // Check if the alias was found
                if (foundVariable) {
                  console.log("Found variable is", foundVariable);
                  variableItem.setValueForMode(currentModeId, {
                    type: 'VARIABLE_ALIAS',
                    id: foundVariable.id
                  });
                } else {
                  console.log(`🚨 Error: Variable ${aliasName} not found`);
                  figma.notify(`🚨 Error: Variable $${aliasName} not found`)
                }
              } else {
                variableItem.setValueForMode(currentModeId, rgba(modes[mode]))
              }

              console.log(`↳ 🌓 ${mode}: ${modes[mode]}`)
              count++
            }

          }

          generatedVariables++


        }
      }

      // Done
      figma.notify(`✅ Generated ${collection.name} collection with ${generatedVariables} variables`)

      getcurrentCollections()
      figma.ui.postMessage({ type: 'complete', data: currentCollectionsDictionary })
    } catch (error: any) {
      let message = error.message;
      // remove everything before :
      message = message.split(': ').pop();
      if (message == 'duplicate variable name') {
        figma.notify(`🚨 Error: Variable names must be unique within a collection`)
      } else {
        figma.notify(`🚨 Error: ${message}`)
      }
    }

  }
}