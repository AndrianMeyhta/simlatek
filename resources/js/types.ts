import Echo from "laravel-echo";
import Pusher from "pusher-js";
// resources/js/types.ts
export interface Tahapan {
    id: number;
    name: string;
}

export interface Constraint {
    id: number;
    permintaantahapan_id: number;
    name: string;
    type: "schedule" | "upload_file" | "text" | "progress";
    detail: {
        target_table: string;
        target_column?: string;
        target_columns?: string[];
        dokumenkategori_id?: number;
        relasi?: string;
        isTesting?: boolean;
        testingtype?: string;
        required: boolean;
        [key: string]: any;
    };
    permintaantahapan?: { name: string };
}

export interface DokumenKategori {
    id: number;
    name: string;
}

export interface ConstrainFormData {
    id: number | null;
    permintaantahapan_id: string;
    type: string;
    name: string;
    required: boolean;
    target_table: string;
    target_column: string;
    target_columns: string[]; // Tambahan untuk progress
    dokumenkategori_id: string | null;
    relasi: string;
    isTesting: boolean;
    testingtype: string;
    isDomain?: boolean;
    domainType?: string;
}

export interface Props extends Record<string, any> {
    tahapans: Tahapan[];
    constraints: Constraint[];
    dokumenKategoris: DokumenKategori[];
}

export interface Field {
    key: string;
    label: string;
    type: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    min?: number;
    max?: number;
    placeholder?: string;
}

export interface CrudModalProps {
    show: boolean;
    onClose: () => void;
    title: string;
    formData: Record<string, string>;
    onChange: (key: string, value: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    fields: Field[];
}

export interface Entity {
    value: string;
    label: string;
}

// Definisikan tipe untuk props
export interface EntitySelectorProps {
    entities: Entity[];
    currentEntity: string;
    onChange: (value: string) => void;
    className?: string; // Add className as optional
}

export interface Column {
    key: string;
    label: string;
    render?: (item: any) => string;
}

// Definisikan tipe untuk data item (dibuat fleksibel dengan index signature)
export interface DataItem {
    id: string | number; // id opsional dan bisa string atau number
    [key: string]: any; // Memungkinkan properti dinamis
}

// Definisikan tipe untuk props
export interface GenericTableProps {
    columns: Column[];
    data: DataItem[];
    onEdit?: (item: any) => void;
    onDelete?: (id: string | number) => void;
}

// Definisikan tipe data untuk response API
export interface Role {
    id: number;
    name: string;
}

export interface Permission {
    role_id: number;
    permintaantahapan_id: number;
}

// Definisikan tipe untuk permission state
export interface PermissionState {
    [roleId: number]: number[];
}

export interface ConstrainListProps {
    constraints: Constraint[];
    dokumenKategoris: DokumenKategori[];
    onEdit: (constraint: Constraint) => void;
    onDelete: (id: number) => void;
    isDeleting: boolean;
}

export interface ConstrainFormProps {
    form: ConstrainFormData;
    setForm: (form: ConstrainFormData) => void;
    tahapans: Tahapan[];
    dokumenKategoris: DokumenKategori[];
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    resetForm: () => void;
    relationOptions: string[];
}

export interface AddButtonProps {
    onClick: () => void;
}

export interface AvailableUser {
    id: number;
    name: string;
    role_id: number;
    skills: Skill[];
    application_count?: number;
}

export interface User {
    name: string;
    role: string;
    id: number;
    role_id: number;
    email?: string;
    skills?: Skill[];
    application_count?: number;
}

export interface ThemeColors {
    bg: string;
    border: string;
    text: string;
    textSecondary: string;
    hoverBg: string;
    activeBg: string;
    activeText: string;
    separator: string;
    cardBg: string;
}

export interface Permintaan {
    id: number;
    nomertiket: string;
    title: string;
    status: string;
    progress: permintaanprogress[];
    created_at: string;
    users: User;
}

// Definisikan tipe untuk props komponen
export interface PermintaanIndexProps {
    permintaans: Permintaan[];
}

export interface Kategori {
    id: string | number;
    name: string;
}

interface InitialData {
    roles?: Role[];
    tahapans?: Tahapan[];
    constraints?: Constraint[];
    dokumenKategoris?: DokumenKategori[];
}

export interface ManageProps {
    initialData?: InitialData;
}

export interface permintaantahapan {
    id: number;
    name: string;
}

export interface ProgressReport {
    id: number;
    permintaanprogress_id: number;
    description: string;
    percentage_change: number;
    created_at: string;
    updated_at: string;
    file?: { filename: string; filepath: string };
    related_files?: { filename: string; filepath: string }[];
}

export interface Project {
    id: number;
    name: string;
    description: string;
    progress: permintaanprogress[];
    dikelola: User;
}

export interface LogAktivitas {
    id: number;
    permintaanprogress_id: number;
    user_id: number;
    action: string;
    description: string;
    created_at: string;
    users: User;
}

export interface Skill {
    id: number;
    name: string;
    description: string | null;
    category: "Development" | "Tester" | "Management" | "Other";
    pivot: {
        id: number;
        user_id: number;
        skill_id: number;
        level: string;
        experience_since: string | null;
        notes: string | null;
    };
}

export interface UserSkill {
    id: number;
    user_id: number;
    skill_id: number;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    experience_since: string | null;
    notes: string | null;
    skill: Skill;
}

export interface ConstrainData {
    id?: number;
    permintaan_id?: number;
    tahapanconstrain_id?: number;
    status: string; // "pending", "fulfilled", "confirmed", dll.
    created_at?: string;
    updated_at?: string;
}

export interface TahapanConstrain {
    id: number;
    name?: string;
    type: "upload_file" | "schedule" | "text" | "progress";
    permintaantahapan_id: number;
    detail?: { [key: string]: any }; // Detail bisa bervariasi
    hasRbieRule?: boolean;
    constraindata?: ConstrainData;
    target_data?: any; // Atau definisikan tipe spesifik seperti di bawah
}

export interface permintaanprogress {
    id: number;
    permintaan_id: number;
    permintaantahapan_id: number;
    percentage: number;
    status: "upcoming" | "current" | "completed";
    description?: string;
    tahapan?: { name: string };
    tahapanconstrains: TahapanConstrain[];
    created_at?: string;
    updated_at?: string;
}

export interface PageProps {
    permintaan: {
        id: number;
        nomertiket: string;
        title: string;
        created_at?: string;
        users?: { name: string };
    };
    project: {
        name: string;
        description?: string;
        dikelola?: { name: string };
    };
    permintaanprogresses: permintaanprogress[];
    logAktivitas?: {
        id: number;
        description: string;
        created_at: string;
        users?: { name: string };
    }[];
    userPermissions: number[];
    permintaanDokumens: {
        id: number;
        filename: string;
        filepath: string;
        dokumenkategori_id: number;
    }[];
    canAddUsers: boolean;
    availableUsers: {
        id: string;
        name: string;
        skills?: { name: string; category: string }[];
        application_count: number;
    }[];
    rekomendasi?: { id: number; status: string; created_at: string } | null;
    role_id?: number;
}

export interface RbieRule {
    id: number;
    tahapan?: Tahapan[];
    name: string;
    preprocessing: any[] | null;
    matching_rules: any[];
}

export interface RbieExtraction {
    id: number;
    permintaan_id: number;
    dokumen_id: number;
    dokumenrelasi_id: number;
    extracted_data: any[];
}

export interface SkplData {
    id?: number;
    extracted_data: string[];
}

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: typeof Echo;
    }
}
