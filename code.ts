figma.showUI(__html__, { width: 500, height: 400 });

console.clear();
// iteare through each variable collection and delete all


figma.ui.onmessage = msg => {

  if (msg.type === 'generate') {
    const jsonObject = JSON.parse(msg.data);

    for (const collectionKey in jsonObject) {
      const collectionParent = figma.variables.createVariableCollection(collectionKey);

      if (jsonObject.hasOwnProperty(collectionKey)) {
        const collection = jsonObject[collectionKey];

        for (const collectionVariable in collection) {
          if (collection.hasOwnProperty(collectionVariable)) {
            let counter = 0;
            const variable = collection[collectionVariable];

            // check if variable has any nested objects otherwise console log the result
            for (const collectionMode in variable) {

              const nestedVariable = variable[collectionMode];
              const color: {
                r: number;
                g: number;
                b: number;
                a: number;
              } | any = hexToRgb(nestedVariable);

              console.log(`🚧 Counter: ${counter}, CollectionParenModes: ${collectionParent.modes.length}`)

              if (counter > 0) {
                // console.log('🔁 Inner loop')

                if(collectionParent.modes.length == counter){
                  console.log('🌓 Adding mode')
                  collectionParent.addMode(collectionMode)
                }

                // TODO figure out how to update the first entry when a new mode is added, collection variable is null for second entry
                const modeId = collectionParent.modes[counter].modeId;
                console.log(counter)
                let id = collectionParent.variableIds[counter]
                // let collection = figma.variables.getVariableById(collectionParent.variableIds[counter])
                let collection = figma.variables.getVariableById(id)
                console.log(figma.variables.getVariableById(collectionParent.variableIds[counter]))
                // console.log(`collectionParent: ${collectionParent}, Counter: ${counter}, modeId: ${modeId}`)
                console.log(`collection: ${collection}`)

                if (collection) {
                  collection.setValueForMode(modeId, {
                    r: color.r,
                    g: color.g,
                    b: color.b,
                    a: color.a

                  })
                  console.log(`✅ Updated ${collection?.name} in ${collectionParent.modes[counter].name} with ${nestedVariable}`)
                } else {

                }

              } else {
                // console.log(' 1️⃣ Creating 1st variable')
                const newModeId = collectionParent.modes[counter].modeId;
                collectionParent.renameMode(newModeId, collectionMode);
                const collection = figma.variables.createVariable(
                  collectionVariable,
                  collectionParent.id,
                  "COLOR"
                )
                collection.setValueForMode(newModeId, {
                  r: color.r,
                  g: color.g,
                  b: color.b,
                  a: color.a

                })

                console.log(`✅ Updated ${collection?.name} in ${collectionParent.modes[counter].name} with ${nestedVariable}`)

              }
              console.log(figma.variables.getLocalVariables())
              counter++;



            }
          }
        }
      }
    }

  }
}

function hexToRgb(hex: string): { r: number, g: number, b: number, a: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    return result ? {
        r: Math.round(parseInt(result[1], 16) / 2.55) / 100,
        g: Math.round(parseInt(result[2], 16) / 2.55) / 100,
        b: Math.round(parseInt(result[3], 16) / 2.55) / 100,
        a: result[4] ? Math.round(parseInt(result[4], 16) / 2.55) / 100 : 1
    } : null;
}