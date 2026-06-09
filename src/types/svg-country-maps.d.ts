declare module "@svg-country-maps/colombia" {
  interface ColombiaMapLocation {
    name: string;
    id: string;
    path: string;
  }

  interface ColombiaMapData {
    label: string;
    viewBox: string;
    locations: ColombiaMapLocation[];
  }

  const colombiaMap: ColombiaMapData;
  export default colombiaMap;
}
