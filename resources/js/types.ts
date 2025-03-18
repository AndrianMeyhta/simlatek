// resources/js/types.ts
export interface Tahapan {
    id: number;
    name: string;
}

export interface Constraint {
    id: number;
    projecttahapan_id: number;
    name: string;
    type: "schedule" | "upload_file" | "text";
    detail: {
        name: string;
        required: boolean;
        target_table: string;
        target_column: string;
        dokumenkategori_id?: number | null;
    };
    project_tahapan?: { name: string };
}

export interface DokumenKategori {
    id: number;
    name: string;
}

export interface ConstrainFormData {
    id: number | null;
    projecttahapan_id: string;
    type: "schedule" | "upload_file" | "text";
    name: string;
    required: boolean;
    target_table: string;
    target_column: string;
    dokumenkategori_id: string | null;
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
    options?: { value: string | number; label: string }[];
}

export interface CrudModalProps {
    show: boolean;
    onClose: () => void;
    title: string;
    formData: Record<string, any>;
    onChange: (key: string, value: any) => void;
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
}

// Definisikan tipe untuk data item (dibuat fleksibel dengan index signature)
export interface DataItem {
    id?: string | number; // id opsional dan bisa string atau number
    [key: string]: any; // Memungkinkan properti dinamis
}

// Definisikan tipe untuk props
export interface GenericTableProps {
    columns: Column[];
    data: DataItem[];
    onEdit: (item: DataItem) => void;
    onDelete: (id: string | number) => void;
}

// Definisikan tipe data untuk response API
export interface Role {
    id: number;
    name: string;
}

export interface Permission {
    role_id: number;
    projecttahapan_id: number;
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
}

export interface AddButtonProps {
    onClick: () => void;
}

export interface User {
    name: string;
    role: string;
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
    progress: number;
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
}

export interface ManageProps {
    initialData?: InitialData;
}

export interface ProjectTahapan {
    id: number;
    name: string;
}

export interface Constraindata {
    id: number;
    project_id: number;
    tahapanconstrain_id: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface TahapanConstrain {
    id: number;
    projecttahapan_id: number;
    name: string; // Langsung gunakan name
    type: 'schedule' | 'upload_file' | 'text'; // Ganti constrain_type menjadi type
    detail: string; // Kolom detail sebagai string (atau array jika di-cast sebagai JSON)
    constraindata?: Constraindata;
}

export interface ProjectProgress {
    id: number;
    project_id: number;
    projecttahapan_id: number;
    status: 'upcoming' | 'current' | 'completed';
    percentage: number;
    description?: string | null;
    tahapan?: ProjectTahapan; // Tetap opsional untuk keamanan
    tahapanconstrains: TahapanConstrain[];
}

export interface Project {
    id: number;
    name: string;
    description: string;
    progress: ProjectProgress[];
    dikelola: User;
}

export interface LogAktivitas {
    id: number;
    projectprogress_id: number;
    user_id: number;
    action: string;
    description: string;
    created_at: string;
    users: User;
}

export interface PageProps {
    permintaan: Permintaan;
    project: Project;
    projectprogresses: ProjectProgress[];
    logAktivitas: LogAktivitas[];
    userPermissions: number[];
}
