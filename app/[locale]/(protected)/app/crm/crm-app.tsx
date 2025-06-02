'use client'
import React, { useState, useMemo, useCallback } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import ColumnContainer from "./column"
import LeadCard from './lead';
import { createPortal } from "react-dom";
import AddBoard from './add-stage';
import { useTranslations } from 'next-intl';
import { Lead, LeadsService } from '@/services/leads.service';
import { Stage, StageService } from '@/services/stage.service';
import CreateLead from './create-lead';
import { useToast } from '@/components/ui/use-toast';
import EmptyStages from './empty-stages';
import { useAuth } from '@/contexts/auth.context';

const CRMApp = ({ stagesData, leadsData, refreshData }: { stagesData: Stage[], leadsData: Lead[], refreshData: () => void }) => {
    const t = useTranslations("CRMApp");
    const { toast } = useToast();
    const { account } = useAuth();
    const [columns, setColumns] = useState<Stage[]>(stagesData.sort((a, b) => a.sequence - b.sequence));
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
    const [leads, setLeads] = useState<Lead[]>(leadsData);
    const [activeColumn, setActiveColumn] = useState<Stage | null>(null);
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(false);

    // create lead state 
    const [open, setOpen] = useState<boolean>(false);
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );
    
    
    
    // Función para actualizar un lead después de moverlo
    const updateLeadStage = useCallback(async (leadId: string, stageId: number) => {
        try {
            await LeadsService.updateLeads({
                id: leadId,
                stage_id: stageId
            }, account.id!);
        } catch (error: any) {
            console.error("Error al actualizar el lead:", error);
            toast({
                title: "Error",
                description: error.message || "Error al actualizar el lead",
                variant: "destructive",
            });
        }
    }, [toast]);
    
    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.stage);
            return;
        }

        if (event.active.data.current?.type === "Lead") {
            setActiveLead(event.active.data.current.lead);
            return;
        }
    }
    
    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveLead(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveAColumn = active.data.current?.type === "Column";
        if (!isActiveAColumn) return;

        console.log("DRAG END");

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
            const overColumnIndex = columns.findIndex((col) => col.id === overId);

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
    }
    
    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveALead = active.data.current?.type === "Lead";
        const isOverALead = over.data.current?.type === "Lead";

        if (!isActiveALead) return;

        if (isActiveALead && isOverALead) {
            setLeads((leads) => {
                const activeIndex = leads.findIndex((l) => l.id === activeId);
                const overIndex = leads.findIndex((l) => l.id === overId);
                
                const previousStageId = leads[activeIndex].stage_id;
                const newStageId = leads[overIndex].stage_id;
                
                if (previousStageId !== newStageId) {
                    // Actualizar el lead en el backend
                    updateLeadStage(activeId.toString(), newStageId);
                    
                    leads[activeIndex].stage_id = newStageId;
                    return arrayMove(leads, activeIndex, overIndex - 1);
                }

                return arrayMove(leads, activeIndex, overIndex);
            });
        }

        const isOverAColumn = over.data.current?.type === "Column";

        if (isActiveALead && isOverAColumn) {
            setLeads((leads) => {
                const activeIndex = leads.findIndex((l) => l.id === activeId);
                const newStageId = parseInt(overId.toString());
                
                // Actualizar el lead en el backend
                updateLeadStage(activeId.toString(), newStageId);
                
                leads[activeIndex].stage_id = newStageId;
                return arrayMove(leads, activeIndex, activeIndex);
            });
        }
    }
    
    function handleOpenLead(): void {
        setOpen(true);
    }

    return (
        <>
            <div className="">
                <div className="flex gap-2 mb-5">
                    <div className="flex-1 font-medium lg:text-2xl text-xl capitalize text-default-900">
                        {t("title")}
                    </div>
                    <div className="flex-none">
                        <AddBoard onStageAdded={refreshData} />
                    </div>
                </div>
                {columns.length === 0 && (
                    <EmptyStages />
                )}
                {columns.length > 0 && (
                    <DndContext
                        sensors={sensors}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onDragOver={onDragOver}
                >
                    <div className="flex gap-4 overflow-x-auto no-scrollbar">
                        <div className="flex gap-4">
                            <SortableContext items={columnsId}>
                                {columns.map((col) => (
                                    <ColumnContainer
                                        key={col.id}
                                        stage={col}
                                        leads={leads.filter((lead) => lead.stage_id === col.id)}
                                        handleOpenLead={() => handleOpenLead()}
                                        onStageDeleted={refreshData}
                                        onLeadUpdated={refreshData}
                                        onLeadDeleted={refreshData}
                                    />
                                ))}
                            </SortableContext>
                        </div>
                    </div>

                    {createPortal(
                        <DragOverlay>
                            {activeColumn && (
                                <ColumnContainer
                                    stage={activeColumn}
                                    handleOpenLead={() => handleOpenLead()}                    
                                    leads={leads.filter((lead) => lead.stage_id === activeColumn.id)}
                                    onStageDeleted={refreshData}
                                    onLeadUpdated={refreshData}
                                    onLeadDeleted={refreshData}
                                />
                            )}
                            {activeLead && <LeadCard lead={activeLead} />}
                        </DragOverlay>,
                        document.body
                    )}
                    </DndContext>
                )}
            </div>
            <CreateLead
                open={open}
                setOpen={setOpen}
                onLeadCreated={refreshData}
            />
        </>
    )

}

export default CRMApp