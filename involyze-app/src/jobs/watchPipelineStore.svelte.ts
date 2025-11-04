import type {JobEvent} from "./useWatchPipeline";

export class PipelineState {
    processingState: "pending" | "started" | "finished" | "ready" | "failed" = $state("ready")
    jobIdOfLastProcessing: string = $state("")

    handleEvent(event : JobEvent){
        if (event.status === "STARTED") {
            this.processingState = "started";
        } else if (event.status === "COMPLETED") {
            this.processingState = "finished";
            this.jobIdOfLastProcessing = event.jobId;
        } else if (event.status === "FAILED") {
            this.processingState = "failed";
            this.jobIdOfLastProcessing = event.jobId;
        }
    }

    pending() {
        this.processingState = "pending";
        this.jobIdOfLastProcessing = "";
    }

}

export const pipelineStore = new PipelineState();

