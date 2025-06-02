'use client'
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { Plus, Trash2 } from "lucide-react";

import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { Stage, StageService } from "@/services/stage.service";
import { Lead } from "@/services/leads.service";
import LeadCard from "./lead";
import EmptyLead from "./empty";
import { toast } from "sonner";

function ColumnContainer({ stage, leads, handleOpenLead, onStageDeleted, onLeadUpdated, onLeadDeleted }: { stage: Stage; leads: Lead[], handleOpenLead: () => void, onStageDeleted: () => void, onLeadUpdated?: () => void, onLeadDeleted?: () => void }) {
    const [editMode, setEditMode] = useState<boolean>(false);

    const [deleteColumn, setDeleteColumn] = useState<boolean>(false);
    const leadsIds = useMemo(() => {
        return leads.map((lead) => lead.id);
    }, [leads]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: stage.id,
        data: {
            type: "Column",
            stage,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    return (
        <>
            <DeleteConfirmationDialog
                open={deleteColumn}
                onClose={() => setDeleteColumn(false)}
                onConfirm={async () => {
                    try {
                        await StageService.deleteStage(stage.id);
                        onStageDeleted();
                        toast("Columna eliminada correctamente");
                    } catch (error: any) {
                        toast(error.message || "Error al eliminar la columna");
                    }
                }}
            />

            <Card
                ref={setNodeRef}
                style={style}
                className={cn("flex-1 w-[280px] bg-default-200 shadow-none app-height flex flex-col relative", {
                    "opacity-20": isDragging,
                })}
            >
                <CardHeader className="flex-none bg-card relative rounded-t-md py-4" {...attributes} {...listeners}>
                    <div className={cn("absolute -start-[1px] top-1/2 -translate-y-1/2 h-[60%] w-0.5 bg-primary",
                        {
                            "bg-warning": (stage.name).toLocaleLowerCase() === "backlog",
                            "bg-success": (stage.name).toLocaleLowerCase() === "done",
                        }
                    )}></div>
                    <div className="flex items-center gap-2" >
                        <div className="flex-1 text-lg capitalize text-default-900 font-medium">{stage.name}</div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="w-6 h-6 bg-transparent  hover:bg-transparent border border-default-200 text-default-600 hover:ring-0 hover:ring-transparent"
                                        onClick={() => setDeleteColumn(true)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-destructive">
                                    <p>Delete</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="w-6 h-6 bg-transparent ring-offset-transparent hover:bg-transparent border border-default-200 text-default-600 hover:ring-0 hover:ring-transparent"
                                        onClick={handleOpenLead}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Add Lead</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 pt-6 px-3.5 h-full overflow-y-auto no-scrollbar">
                    {/* Column task container */}
                    <div className=" space-y-6">
                        {leads?.length === 0 && <EmptyLead />}
                        <SortableContext items={leadsIds}>
                            {leads.map((lead) => (
                                <LeadCard lead={lead} key={lead.id} onLeadUpdated={onLeadUpdated} onLeadDeleted={onLeadDeleted} />
                            ))}
                        </SortableContext>
                    </div>
                </CardContent>

            </Card>
        </>
    );
}

export default ColumnContainer;
