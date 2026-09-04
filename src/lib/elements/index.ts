const tags = new Map<CustomElementConstructor, string>();

export function define(tag: string, ctor: CustomElementConstructor) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
  tags.set(ctor, tag);
}

export function byId<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function all<T extends HTMLElement>(ctor: new () => T): T[] {
  const tag = tags.get(ctor as unknown as CustomElementConstructor);
  return tag ? [...document.querySelectorAll<T>(tag)] : [];
}
