"use strict";
figma.showUI(__html__, { width: 500, height: 400 });
const localVariables = figma.variables.getLocalVariableCollections();
figma.ui.onmessage = msg => {
    const dataInputRaw = JSON.parse(msg.data);
    const dataInputObj = Object.keys(dataInputRaw).map((key) => {
        return dataInputRaw[key];
    });
    if (msg.type === 'generate') {
        console.log(dataInputRaw);
        console.log(dataInputObj);
        console.log(dataInputObj.length);
        // iterate through item and create a variable for each entry
        for (let i = 0; i < dataInputObj.length; i++) {
            const variableName = dataInputObj[i].name;
            const variableValue = dataInputObj[i].value;
            // create variable
            // const collection = figma.variables.createVariableCollection();
            // const variable = figma.variables.createVariable({
            //   name: "myVariable",
            //   collectionID: "Collection",
            // });
            // create variable collection
            // const variableCollection = figma.createLocalVariableCollection();
            // variableCollection.name = variableName;
            // variableCollection.description = variableName;
            // variableCollection.variableIds = [variable.id];
            // add variable to collection
            // figma.variables.setLocalVariableCollection(variableCollection);
        }
    }
};
// localVariables.forEach((collection) => {
//   console.log(`### ${collection.name}`);
//   collection.variableIds.forEach((variableNode) => {
//     let variableItem = figma.variables.getVariableById(variableNode)
//     let variableMode = variableItem?.valuesByMode;
//     figma.variables.getVariableById(variableNode)
//   }
//   });
// });
// function rgbToHex({ r, g, b }) {
//   const toHex = (value) => {
//     const hex = Math.round(value * 255).toString(16);
//     return hex.length === 1 ? "0" + hex : hex;
//   };
//   const hex = [toHex(r), toHex(g), toHex(b)].join("");
//   return `#${hex}`;
// }
