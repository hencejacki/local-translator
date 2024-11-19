import { checkItems, LoadType } from "../constant.js";

const ret = await chrome.storage.local.get(["virgin"]);
if (typeof ret.virgin === "undefined" || ret.virgin) {
    await chrome.storage.local.set({ virgin: false });
    createCheckBox(LoadType.LOAD_FROM_LOCAL);
}
else {
    await createCheckBox(LoadType.LOAD_FROM_CACHE);
}

async function createCheckBox(loadType) {
    const template = document.querySelector("template");
    const checkBoxes = new Set();

    for (const item of checkItems) {
        const checkId = item.option + '-' + item.id;
        const element = template.content.firstElementChild.cloneNode(true);
        element.querySelector("input").id = checkId;
        element.querySelector("input").value = item.option;
        element.querySelector("input").checked = item.defaultChecked;
        element.querySelector("input").addEventListener("change", () => {
            chrome.storage.local.set({ [checkId]: element.querySelector("input").checked });
        })
        element.querySelector("label").htmlFor = checkId;
        element.querySelector("label").textContent = item.option;
        if (loadType === LoadType.LOAD_FROM_CACHE) {
            const result = await chrome.storage.local.get([checkId]);
            element.querySelector("input").checked = result[checkId];
        }
        else {
            chrome.storage.local.set({ [checkId]: item.defaultChecked });
        }
        checkBoxes.add(element);
    }
    document.querySelector("ul").append(...checkBoxes);
}