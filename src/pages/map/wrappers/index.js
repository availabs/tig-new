import countiesWrapper from "./countiesWrapper";
import Counties from "./Counties"

const counties =
    {
        path: "/load_counties",
        mainNav: false,
        name: "Load Counties",
        exact: true,
        //authLevel: 0,
        layoutSettings: {
            fixed: true,
            navBar: 'side',
            headerBar: {
                title: "Load Counties JSON"
            }
        },
        component: {
            type: Counties,
            wrappers: [
                "show-loading",
                countiesWrapper,
                "avl-falcor"
            ]
        }
    }


const routes = [
    counties
];
export default routes;
