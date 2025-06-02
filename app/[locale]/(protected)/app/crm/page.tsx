'use client'

import React, { useEffect, useState, useCallback } from 'react'
import CRMApp from './crm-app'
import { Stage, StageService } from '@/services/stage.service';
import { Lead, LeadsService } from '@/services/leads.service';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const CRMPage = () => {
    const [stages, setStages] = useState<Stage[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Función para recargar los datos
    const refreshData = useCallback(async () => {
            try {
                setLoading(true);
                const [newStages, newLeads] = await Promise.all([
                    StageService.getStages(),
                    LeadsService.getLeads()
                ]);
                setStages(newStages);
                setLeads(newLeads);
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Error al actualizar los datos",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }, [toast]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Cargar etapas y leads en paralelo
                const [stagesData, leadsData] = await Promise.all([
                    StageService.getStages(),
                    LeadsService.getLeads()
                ]);
                
                setStages(stagesData);
                setLeads(leadsData);
            } catch (err: any) {
                console.error('Error al cargar datos del CRM:', err);
                setError(err.message || 'Error al cargar datos del CRM');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex gap-4 overflow-x-auto">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[272px] rounded-md border border-border bg-card p-4">
                            <Skeleton className="h-6 w-3/4 mb-4" />
                            <div className="space-y-3">
                                <Skeleton className="h-20 w-full rounded-md" />
                                <Skeleton className="h-20 w-full rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    <p>Error: {error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-2 bg-primary text-white px-4 py-2 rounded-md text-sm"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <CRMApp
            stagesData={stages}
            leadsData={leads}
            refreshData={refreshData}
        />
    )
}

export default CRMPage