"use client"
import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Task } from "./data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import {  MoreVertical, SquarePen, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { useState } from "react";
import EditTask from "./edit-lead";
import { Icon } from "@/components/ui/icon";
import { Lead, LeadsService } from "@/services/leads.service";

function LeadCard({ lead, onLeadUpdated, onLeadDeleted }: { lead: Lead, onLeadUpdated?: () => void, onLeadDeleted?: () => void }) {
    const { id, name, stage_id, type, user_id, account_id, description, active } = lead;
    const [open, setOpen] = useState<boolean>(false);
    const [editTaskOpen, setEditTaskOpen] = useState<boolean>(false);
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: id,
        data: {
            type: "Lead",
            lead,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const handleDelete = async () => {
        try {
            await LeadsService.deleteLead(id);
            onLeadDeleted?.();
        } catch (error) {
            console.error("Error al eliminar el lead:", error);
        }
    };

    return (
        <>
            <DeleteConfirmationDialog
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={handleDelete}
            />
            <EditTask
                open={editTaskOpen}
                setOpen={setEditTaskOpen}
                lead={lead}
                onLeadUpdated={onLeadUpdated}
            />
            <Card
                className={cn("", {
                    "opacity-10 bg-primary/50 ": isDragging,
                })}
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
            >
                <CardHeader className="flex-row gap-1 p-2.5 items-center space-y-0">
                    <Avatar className="flex-none h-8 w-8 rounded bg-default-200 text-default hover:bg-default-200">
                        <AvatarImage src={'https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg'} />
                        <AvatarFallback className="uppercase">  {name.charAt(0) + name.charAt(1)}</AvatarFallback>
                    </Avatar>
                    <h3 className="flex-1 text-default-800 text-lg font-medium max-w-[160px] truncate text-center capitalize ">{name}</h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                className="flex-none ring-offset-transparent bg-transparent hover:bg-transparent hover:ring-0 hover:ring-transparent w-6"
                            >
                                <MoreVertical className="h-4 w-4 text-default-900" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="p-0 overflow-hidden" align="end" >
                            <DropdownMenuItem
                                className="py-2 border-b border-default-200 text-default-600 focus:bg-default focus:text-default-foreground rounded-none cursor-pointer"
                                onClick={() => setEditTaskOpen(true)}
                            >
                                <SquarePen className="w-3.5 h-3.5 me-1" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="py-2 bg-destructive/30 text-destructive focus:bg-destructive focus:text-destructive-foreground rounded-none cursor-pointer"
                                onClick={() => setOpen(true)}
                            >
                                <Trash2 className="w-3.5 h-3.5  me-1" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="p-2.5 pt-1">
                    <div className="text-default-600 text-sm">{description}</div>
                    <div className="flex gap-4 mt-6">
                        <div>
                            <div className="text-xs text-default-400 mb-1">User Relacionado</div>
                            <div className="text-xs text-default-600  font-medium">{user_id}</div>
                        </div>
                        <div>
                            <div className="text-xs text-default-400 mb-1">Cuenta Relacionada</div>
                            <div className="text-xs text-default-600  font-medium">{account_id}</div>
                        </div>
                    </div>
                    <div className="mt-1">
                        <div className="text-end text-xs text-default-600 mb-1.5 font-medium">{100}%</div>
                        <Progress value={100} color="primary" size="sm" />
                    </div>
                    <div className="flex mt-5">
                        <div className="flex-1">
                            <div className="flex items-center gap-1 bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-sm mt-1">
                                <Icon icon="heroicons-outline:clock" />
                                {active ? "Active" : "Inactive"}
                            </div>
                        </div>
                    </div>
                    <div className="flex mt-5">
                        <div className="flex-1">
                            <div className="flex items-center gap-1 bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-sm mt-1">
                                {type}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

export default LeadCard;
