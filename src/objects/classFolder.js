export class Folder {
    constructor(name, parent = null, icon = '') {
        this.name = name;
        this.parent = parent;
        this.children = [];
        this.icon = icon;
    }

    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }

    removeChild(childName) {
        this.children = this.children.filter(child => child.name !== childName);
    }

    getChild(childName) {
        return this.children.find(child => child.name === childName);
    }

    getPath() {
        if (this.parent) {
            return `${this.parent.getPath()}/${this.name}`;
        } else {
            return this.name;
        }
    }
}