import { ProcessStep, WaterSource, PRPKey, BusinessType, WaterHaccpPlan, ProcessFlow, HazardAnalysisResult } from "../types.ts";

// Mock function to simulate a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeAllergens = async (ingredients: string[]): Promise<string[]> => {
    await sleep(1000);
    const commonAllergens = ['Gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts', 'Soybeans', 'Milk', 'Nuts'];
    const foundAllergens = new Set<string>();

    const text = ingredients.join(' ').toLowerCase();

    if (text.includes('wheat') || text.includes('flour') || text.includes('bread')) foundAllergens.add('Gluten');
    if (text.includes('shrimp') || text.includes('crab')) foundAllergens.add('Crustaceans');
    if (text.includes('egg')) foundAllergens.add('Eggs');
    if (text.includes('fish') || text.includes('tuna') || text.includes('salmon')) foundAllergens.add('Fish');
    if (text.includes('peanut')) foundAllergens.add('Peanuts');
    if (text.includes('soy') || text.includes('tofu')) foundAllergens.add('Soybeans');
    if (text.includes('milk') || text.includes('cheese') || text.includes('butter') || text.includes('cream')) foundAllergens.add('Milk');
    if (text.includes('almond') || text.includes('walnut') || text.includes('cashew')) foundAllergens.add('Nuts');

    return Array.from(foundAllergens);
};

export const generateRequiredTestsForMaterial = async (material: string): Promise<string[]> => {
    await sleep(1000);
    const materialLower = material.toLowerCase();
    if (materialLower.includes('meat') || materialLower.includes('chicken') || materialLower.includes('لحم')) {
        return ['Salmonella Test', 'E. coli Test', 'Listeria Test', 'Residue Analysis'];
    }
    if (materialLower.includes('milk') || materialLower.includes('dairy') || materialLower.includes('حليب')) {
        return ['Antibiotic Residue Test', 'Somatic Cell Count', 'Standard Plate Count'];
    }
     if (materialLower.includes('nuts') || materialLower.includes('moxrat')) {
        return ['Aflatoxin Test'];
    }
    return ['Visual Inspection', 'Microbiological Analysis'];
};

export const generateHazardAnalysisForFlow = async (steps: ProcessStep[]): Promise<ProcessStep[]> => {
    await sleep(1500);
    return steps.map(step => {
        const desc = step.description.toLowerCase();
        // FIX: Explicitly type `analysis` to allow for different values for `controlPointType` and `hazards.type`.
        let analysis: HazardAnalysisResult = {
            hazards: [{ type: 'biological', description: 'Bacterial growth' }],
            cause: 'Time-temperature abuse',
            controlMeasures: 'Monitor temperature and time',
            isCCP: false,
            controlPointType: 'PRP',
            justification: 'Q1: Yes, Control Measure exists -> PRP'
        };
        if (desc.includes('cook') || desc.includes('cooking') || desc.includes('bake') || desc.includes('pasteurize') || desc.includes('طهي')) {
            analysis = {
                hazards: [{ type: 'biological', description: 'Survival of pathogens' }],
                cause: 'Inadequate cooking time/temperature',
                controlMeasures: 'Cook to a validated internal temperature for a specific time.',
                isCCP: true,
                controlPointType: 'CCP',
                justification: 'Q1: No, Q2: Yes, Step eliminates hazard -> CCP'
            };
        }
        if (desc.includes('metal detection') || desc.includes('x-ray')) {
            analysis = {
                hazards: [{ type: 'physical', description: 'Metal fragments' }],
                cause: 'Contamination from equipment',
                controlMeasures: 'Pass product through a calibrated metal detector.',
                isCCP: true,
                controlPointType: 'CCP',
                justification: 'Q1: No, Q2: Yes, Step eliminates hazard -> CCP'
            };
        }
        return { ...step, hazardAnalysis: analysis };
    });
};

export const generateCCPs = async (steps: ProcessStep[]): Promise<string> => {
    await sleep(1000);
    const header = `| خطوة العملية | الخطر الكبير | هل هي CCP؟ (نعم/لا) | التبرير (باستخدام أسئلة شجرة القرارات) |`;
    const separator = `|---|---|---|---|`;
    const rows = steps.filter(s => s.hazardAnalysis).map(s => {
        const analysis = s.hazardAnalysis!;
        const isCCP = analysis.controlPointType === 'CCP';
        const hazardDesc = analysis.hazards[0]?.description || 'N/A';
        return `| ${s.description} | ${hazardDesc} | ${isCCP ? 'نعم' : 'لا'} | ${analysis.justification} |`;
    }).join('\n');
    return [header, separator, rows].join('\n');
};

export const generateCriticalLimits = async (ccpMarkdown: string): Promise<string> => {
    await sleep(1000);
    return `| نقطة التحكم الحرجة (CCP) | الخطر الذي يتم التحكم فيه | الحد الحرج المقترح | التبرير العلمي للحد الحرج |
|---|---|---|---|
| الطهي | Survival of pathogens | طهي المنتج إلى درجة حرارة داخلية لا تقل عن 75 درجة مئوية لمدة 15 ثانية. | هذا الحد معترف به للقضاء على معظم مسببات الأمراض البكتيرية مثل السالمونيلا. |
| كشف المعادن | Metal fragments | يجب ألا يتم الكشف عن أي شظايا حديدية أكبر من 1.5 مم، أو غير حديدية أكبر من 2.0 مم. | هذه الحدود تتماشى مع معايير الصناعة لسلامة الأغذية. |
    `;
};

export const generateMonitoringProcedures = async (limitsMarkdown: string, flow: ProcessFlow): Promise<string> => {
    await sleep(1000);
     return `| نقطة التحكم الحرجة (CCP) | ماذا سيتم رصده؟ | كيف سيتم الرصد؟ (الطريقة والأداة) | التكرار | من المسؤول عن الرصد؟ |
|---|---|---|---|---|
| الطهي | درجة الحرارة الداخلية ووقت الطهي | باستخدام ميزان حرارة معاير ومؤقت | لكل دفعة إنتاج | طاهي الخط الساخن |
| كشف المعادن | عمل جهاز كشف المعادن | تمرير عينات اختبار قياسية (حديدية وغير حديدية) | في بداية كل وردية، وكل ساعة | مشغل خط التعبئة |
    `;
};


export const generateCorrectiveActions = async (limitsMarkdown: string, flow: ProcessFlow): Promise<string> => {
    await sleep(1000);
    return `| نقطة التحكم الحرجة (CCP) | الانحراف (عندما لا يتم الالتزام بالحد الحرج) | الإجراء التصحيحي الفوري | الإجراء لمنع التكرار | من المسؤول؟ | السجل المطلوب |
|---|---|---|---|---|---|
| الطهي | درجة الحرارة الداخلية أقل من 75 درجة مئوية | استمر في الطهي حتى الوصول إلى درجة الحرارة المطلوبة. | إعادة تدريب الطاهي على استخدام ميزان الحرارة. | مدير المطبخ | سجل الإجراء التصحيحي |
| كشف المعادن | الجهاز يصدر إنذارًا أو يفشل في اكتشاف عينة الاختبار | عزل جميع المنتجات منذ آخر فحص ناجح وإعادة فحصها. | معايرة أو صيانة الجهاز. | مشرف الجودة | سجل الإجراء التصحيحي لكشف المعادن |
    `;
};

export const generateVerificationProcedures = async (planSoFar: any): Promise<string> => {
    await sleep(1000);
    return `| نشاط التحقق | الغرض من النشاط | التكرار | المسؤول | السجل |
|---|---|---|---|---|
| معايرة موازين الحرارة | التأكد من دقة قراءات درجة الحرارة | شهرياً | مدير الجودة | سجل معايرة المعدات |
| مراجعة سجلات الرصد والإجراءات التصحيحية | التأكد من أن النظام يتم اتباعه بشكل صحيح | أسبوعياً | قائد فريق الهاسب | سجل مراجعة الهاسب |
| اختبار مسحات بيئية (Environmental Swabs) | التحقق من فعالية برامج التنظيف والتطهير | ربع سنوياً | مختبر خارجي | تقارير الاختبارات المعملية |
| تدقيق داخلي لنظام الهاسب | تقييم شامل لفعالية وتطبيق خطة الهاسب | سنوياً | فريق التدقيق الداخلي | تقرير التدقيق الداخلي |
    `;
};

export const generateRecordKeepingPlan = async (productName: string): Promise<string> => {
     await sleep(1000);
    return `| اسم السجل / النموذج | الغرض من السجل | موقع الحفظ | مدة الحفظ |
|---|---|---|---|
| سجل رصد درجة حرارة الطهي | توثيق أن كل دفعة من ${productName} وصلت إلى الحد الحرج | قسم الطهي، ثم الأرشيف | سنتان |
| سجل الإجراءات التصحيحية للطهي | توثيق أي انحرافات والإجراءات المتخذة | قسم الجودة | سنتان |
| سجل معايرة موازين الحرارة | إثبات أن أدوات القياس دقيقة | قسم الصيانة | ثلاث سنوات |
| سجلات تدريب الموظفين | توثيق تدريب الموظفين على خطة الهاسب | قسم الموارد البشرية | طوال فترة عمل الموظف + سنتان |
    `;
};

export const generatePRP = async (prpKey: PRPKey, businessType: BusinessType, imageData?: { base64: string, mimeType: string }): Promise<string> => {
    await sleep(1500);
    if (prpKey === 'pestControl' && imageData) {
        return `### خطة مكافحة الآفات (مع تحليل المخطط)
        
**1. مقدمة:** تم تحليل مخطط المنشأة المرفوع لتحديد النقاط الحرجة.

**2. توزيع المصائد:**
- **مصائد فئران (صناديق طعم):** سيتم وضعها كل 15 مترًا على طول الجدار الخارجي للمبنى.
- **مصائد حشرات طائرة (صاعق ضوئي):** سيتم وضعها عند مدخل منطقة الاستلام ومدخل الإنتاج، بعيدًا عن المنتج المكشوف.
- **مصائد حشرات زاحفة (لاصقة):** سيتم وضعها تحت الأحواض وفي زوايا المستودعات.

**3. خريطة توزيع المصائد:** (هنا يتم الإشارة إلى أن الخريطة تم إنشاؤها بناءً على الصورة).
`;
    }
    return `### خطة ${prpKey}

هذه خطة أساسية تم إنشاؤها بواسطة الذكاء الاصطناعي لنشاط (${businessType}).

**1. الهدف:** ...
**2. الإجراءات:** ...
**3. المسؤوليات:** ...
**4. السجلات:** ...
`;
};

export const generateWaterHaccpPlan = async (source: WaterSource, sketchData?: { base64: string, mimeType: string }): Promise<WaterHaccpPlan> => {
    await sleep(2000);
    return {
        source,
        sketchUrl: sketchData ? 'data:image/png;base64,...' : undefined,
        requiredTests: [
            { id: 'wt1', name: 'Total Coliforms', frequency: 'monthly', lastCheck: null },
            { id: 'wt2', name: 'Free Chlorine Residual', frequency: 'daily', lastCheck: null },
            { id: 'wt3', name: 'pH Level', frequency: 'weekly', lastCheck: null },
        ],
        recommendedFilters: [
            { id: 'wf1', type: 'Sediment Filter', maintenanceSchedule: 'Clean monthly, replace annually' },
            { id: 'wf2', type: 'Activated Carbon Filter', maintenanceSchedule: 'Replace every 6 months' },
        ],
        chemicals: ['Sodium Hypochlorite (as needed for disinfection)'],
        haccpDetails: `### خطة هاسب المياه لمصدر (${source})

| الخطوة | الخطر | إجراء التحكم | الحد الحرج | الرصد | الإجراء التصحيحي |
|---|---|---|---|---|---|
| نقطة دخول المياه الرئيسية | تلوث ميكروبيولوجي | الترشيح والكلورة | الكلور المتبقي 0.5-1.0 ppm | فحص يومي بجهاز قياس الكلور | زيادة جرعة الكلور، فحص الشبكة |
| خزان المياه | نمو الطحالب والبكتيريا | تنظيف وتطهير دوري | خزان نظيف بصرياً | فحص شهري | تفريغ وتنظيف الخزان |
`
    };
};

export const generateEquipmentSOP = async (type: string, name: string): Promise<string> => {
    await sleep(1200);
    return `
### إجراء التشغيل القياسي (SOP) لـ: ${name} (النوع: ${type})

**1. احتياطات السلامة:**
- تأكد من فصل الجهاز عن مصدر الطاقة قبل التنظيف.
- ارتداء معدات الوقاية الشخصية المناسبة (قفازات، نظارات واقية).

**2. خطوات التشغيل:**
- **قبل التشغيل:** تفقد الجهاز للتأكد من نظافته وعدم وجود أي تلف.
- **أثناء التشغيل:** راقب أداء الجهاز واستمع لأي أصوات غير طبيعية.
- **بعد التشغيل:** قم بإيقاف تشغيل الجهاز وتنظيفه حسب التعليمات.

**3. الفحوصات اليومية:**
- فحص كابلات الطاقة.
- التأكد من أن جميع أجزاء الحماية في مكانها.
    `;
};

export const generateCleaningInstructions = async (type: string, name: string): Promise<string> => {
    await sleep(1200);
    return `
### إرشادات التنظيف والتطهير لـ: ${name}

**1. المواد المطلوبة:**
- منظف معتمد غذائياً.
- مطهر معتمد غذائياً.
- فرشاة ناعمة، قطعة قماش نظيفة.

**2. خطوات التنظيف:**
1.  **التفكيك:** فكك الأجزاء القابلة للإزالة.
2.  **الشطف الأولي:** اشطف بالماء الدافئ لإزالة بقايا الطعام الكبيرة.
3.  **الغسيل بالمنظف:** اغسل جميع الأسطح باستخدام محلول المنظف.
4.  **الشطف النهائي:** اشطف جيداً بالماء النظيف لإزالة كل آثار المنظف.

**3. خطوات التطهير:**
1.  **تطبيق المطهر:** قم بتطبيق محلول المطهر على جميع الأسطح.
2.  **وقت التلامس:** اترك المطهر للمدة الموصى بها من قبل الشركة المصنعة.
3.  **التجفيف:** اترك الأجزاء لتجف في الهواء أو استخدم منشفة نظيفة.
4.  **إعادة التركيب:** أعد تركيب الجهاز.
    `;
};