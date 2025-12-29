
function slugify(text) {
    const turkishMap = {
        'ç': 'c', 'Ç': 'C',
        'ğ': 'g', 'Ğ': 'G',
        'ı': 'i', 'İ': 'I',
        'ö': 'o', 'Ö': 'O',
        'ş': 's', 'Ş': 'S',
        'ü': 'u', 'Ü': 'U'
    };

    let slug = text;
    for (const [turkish, english] of Object.entries(turkishMap)) {//karakter değiştirme işlemi
        slug = slug.replace(new RegExp(turkish, 'g'), english);
    }

    slug = slug.toLowerCase();

    slug = slug.replace(/[^a-z0-9\s-]/g, '');//özel karakterleri kaldırıyoruz bunu yapmamızdaki amaç url uyumlu olmayan karakterleri kaldırmak

    slug = slug.replace(/\s+/g, ' ');//birden fazla boşluk için önlem alıp tek boşluğa çeviriyoruz

    slug = slug.replace(/\s/g, '-');//boşlukları - ile değiştiriyoruz

    slug = slug.replace(/^-+|-+$/g, '');//başta ve sonda bulunan - işaretlerini kaldırıyoruz

    return slug;
}

async function createUniqueSlug(text, checkExists) {

    let baseSlug = slugify(text);
    
    //Eğer slug boşsa (sadece özel karakterler varsa), rastgele bir slug oluştur
    if (!baseSlug) {
        baseSlug = 'sorun-' + Date.now();
    }

    
    let uniqueSlug = baseSlug;
    let counter = 1;

    
    while (await checkExists(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
    }

    return uniqueSlug;
}

module.exports = {
    slugify,
    createUniqueSlug
};

