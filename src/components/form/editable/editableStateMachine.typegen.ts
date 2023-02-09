
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "xstate.after(500)#EditMachine.Edit Capture Failed": { type: "xstate.after(500)#EditMachine.Edit Capture Failed" };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "submit": "done.invoke.EditMachine.Edit Active.Capturing Changes:invocation[0]";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: "submit";
        };
        eventsCausingActions: {
          
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "submit": "confirm changes";
        };
        matchesStates: "Edit Active" | "Edit Active.Capturing Changes" | "Edit Active.Form Control Shown" | "Edit Capture Failed" | "Edit Inactive" | { "Edit Active"?: "Capturing Changes" | "Form Control Shown"; };
        tags: never;
      }
  