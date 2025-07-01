import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface activeProjectState{
    projectId:string | null
}

const savedProject = localStorage.getItem("current_project");
const defaultState: activeProjectState = {
  projectId: savedProject ? JSON.parse(savedProject) : "",
};

const activeProjectSlice = createSlice({
    name:"active-project",
    initialState:defaultState,
    reducers:{
        updateProjectId: (state, action: PayloadAction<string>) => {
            localStorage.setItem("current_project",JSON.stringify(action.payload));
            state.projectId = action.payload;
        },
        clearProjectId: (state) => {
            localStorage.setItem("current_project",JSON.stringify(""));
            state.projectId=""
        }
    }
})

export const {updateProjectId, clearProjectId} = activeProjectSlice.actions;
export default activeProjectSlice.reducer; 

