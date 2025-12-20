import { Language, ParticipantGroup } from "../types/enums";

export const DEMOGRAPHICS_DATA = {
  [Language.TR]: {
    consent: {
      [ParticipantGroup.STANDARD]:
        "Bu çalışmaya katıldığınız için teşekkür ederiz. Katılımınız tamamen gönüllüdür. Bu ankette yalnızca temel demografik bilgiler sorulacaktır. Yanıtlarınız yalnızca bilimsel amaçlarla toplanacak ve analiz edilecektir. Verileriniz gizli tutulacak ve araştırma ekibi dışında kimseyle paylaşılmayacaktır.",
      [ParticipantGroup.HERITAGE]:
        "Bu çalışmaya katıldığınız için teşekkür ederiz. Katılımınız tamamen gönüllüdür. Bu ankette hem temel demografik bilgileriniz hem de Türkçe ve Almanca ile ilgili dil deneyiminiz hakkında sorular yer almaktadır. Yanıtlarınız yalnızca bilimsel amaçlarla toplanacak ve analiz edilecektir. Verileriniz gizli tutulacak ve araştırma ekibi dışında kimseyle paylaşılmayacaktır.",
      checkbox:
        "Yukarıdaki bilgileri okudum ve anladım. 18 yaşından büyük olduğumu teyit ediyorum ve çalışmaya gönüllü olarak katılmayı kabul ediyorum.",
    },
    questions: {
      age: "Yaşınız kaç?",
      gender: {
        title: "Cinsiyetiniz nedir?",
        options: [
          "Kadın",
          "Erkek",
          "İkili olmayan (non-binary)",
          "Belirtmek istemiyorum",
          "Diğer",
        ],
      },
      mother_tongue:
        "Ana dil(ler)iniz hangisi/hangileri? (Birden fazla seçebilirsiniz.)",
      other_languages:
        "Anadil(ler)iniz dışında hangi dil(ler)i konuşuyorsunuz? (Varsa lütfen listeleyin.)",
      education: {
        title: "En yüksek tamamladığınız eğitim seviyesi nedir?",
        options: [
          "İlkokul",
          "Ortaokul",
          "Lise",
          "Ön lisans",
          "Lisans",
          "Yüksek lisans",
          "Doktora",
          "Diğer",
        ],
      },
      department: "Şu anda okuduğunuz / mezun olduğunuz bölüm nedir?",
    },
    heritage_specific: {
      born_germany: "Almanya’da mı doğdunuz?",
      move_year: "Almanya’ya ne zaman taşındınız? (Yıl giriniz)",
      parents_lang:
        "Ebeveynlerinizin ana dilleri nelerdir? (Ebeveyn 1 / Ebeveyn 2)",
      helex_proficiency_title:
        "Lütfen her dilde ne kadar iyi konuştuğunuzu, anladığınızı, okuduğunuzu ve yazdığınızı değerlendirin.",
      helex_questions: [
        "Bu dili ne kadar iyi anlayabilirsiniz?",
        "Bu dili ne kadar iyi konuşabilirsiniz?",
        "Bu dilde ne kadar iyi okuyabiliyorsunuz?",
        "Bu dilde ne kadar iyi yazabilirsiniz?",
      ],
      helex_options: [
        "Neredeyse hiç",
        "Pek iyi değil",
        "Oldukça iyi",
        "Çok iyi",
        "İlgili değil",
      ],
      frequency_title:
        "Kullandığınız tüm diller için bunları ne sıklıkta kullandığınızı değerlendirin.",
      frequency_questions: [
        "Bu dili ne sıklıkla duyuyorsunuz?",
        "Bu dili ne sıklıkla konuşuyorsunuz?",
        "Bu dilde ne sıklıkla okuyorsunuz?",
        "Bu dilde ne sıklıkla yazıyorsunuz?",
      ],
      frequency_options: [
        "(neredeyse) hiçbir zaman",
        "yılda birkaç kez",
        "ayda bir",
        "haftada bir",
        "haftada birkaç kez",
        "günde bir (çoğu gün)",
        "günde birkaç kez (çoğu gün)",
      ],
      identity_statement: "Türkçe konuşurken kendim gibi hissediyorum.",
      identity_options: [
        "Tamamen katılmıyorum",
        "Çoğunlukla katılmıyorum",
        "Biraz katılmıyorum",
        "Ne katılıyorum ne katılmıyorum",
        "Biraz katılmıyorum",
        "Genel olarak katılıyorum",
        "Tamamen katılıyorum",
        "Fikrim yok",
      ],
      travel_title:
        "Lütfen Türkiye’ye yaptığınız ziyaretlerin sıklığı ve sürelerini belirtiniz.",
      visit_count_title: "Yılda kaç kez Türkiye’ye gidiyorsunuz?",
      visit_count_options: [
        "Asla",
        "Her yıl değil",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ],
      visit_duration_title:
        "Türkiye’ye gittiğinizde ziyaret başına ne kadar zaman harcıyorsunuz?",
      visit_duration_options: [
        "Ziyaret etmiyorum",
        "2–3 gün",
        "Bir hafta",
        "2 hafta",
        "3 hafta",
        "Bir ay",
        "Bir buçuk ay",
        "İki ay",
        "3 ay",
        "4 ay",
        "4 aydan fazla",
      ],
    },
    messages: {
      completion:
        "Bu bölümün sonuna geldiniz. Katılımınız için teşekkür ederiz! Yanıtlarınız kaydedilmiştir.",
    },
  },
  [Language.DE]: {
    consent: {
      [ParticipantGroup.STANDARD]:
        "Vielen Dank für Ihre Teilnahme an dieser Studie. Die Teilnahme ist vollständig freiwillig. In diesem Fragebogen werden ausschließlich grundlegende demografische Angaben erhoben. Ihre Antworten werden nur zu wissenschaftlichen Zwecken erhoben und ausgewertet. Ihre Daten werden vertraulich behandelt und nicht an Personen außerhalb des Forschungsteams weitergegeben.",
      [ParticipantGroup.HERITAGE]:
        "Vielen Dank für Ihre Teilnahme an dieser Studie. Die Teilnahme ist vollständig freiwillig. In diesem Fragebogen werden sowohl grundlegende demografische Angaben als auch Fragen zu Ihren Spracherfahrungen mit Türkisch und Deutsch erhoben. Ihre Antworten werden nur zu wissenschaftlichen Zwecken erhoben und ausgewertet. Ihre Daten werden vertraulich behandelt und nicht an Personen außerhalb des Forschungsteams weitergegeben.",
      checkbox:
        "Ich habe die obigen Informationen gelesen und verstanden. Ich bestätige, dass ich mindestens 18 Jahre alt bin, und erkläre mich freiwillig mit der Teilnahme an der Studie einverstanden.",
    },
    questions: {
      age: "Wie alt sind Sie?",
      gender: {
        title: "Was ist Ihr Geschlecht?",
        options: [
          "Weiblich",
          "Männlich",
          "Nicht-binär",
          "Möchte ich nicht angeben",
          "Sonstiges",
        ],
      },
      mother_tongue:
        "Was ist/sind Ihre Muttersprache(n)? (Mehrfachauswahl möglich.)",
      other_languages:
        "Welche anderen Sprachen sprechen Sie zusätzlich zu Ihrer/Ihren Muttersprache(n)? (Falls zutreffend bitte auflisten.)",
      education: {
        title: "Was ist Ihr höchster abgeschlossener Bildungsabschluss?",
        options: [
          "Grundschule",
          "Sekundarstufe I (Haupt-/Realschule)",
          "Sekundarstufe II (Abitur)",
          "Berufsausbildung",
          "Bachelor",
          "Master",
          "Promotion",
          "Sonstiges",
        ],
      },
      department:
        "In welchem Fachbereich studieren Sie veya haben Sie Ihr Studium abgeschlossen?",
    },
    // 🛡️ TS Hatalarını çözen Heritage bloğu (Almanca)
    heritage_specific: {
      born_germany: "Sind Sie in Deutschland geboren?",
      move_year: "Wann sind Sie nach Deutschland gezogen? (Jahr eingeben)",
      parents_lang:
        "Was sind die Muttersprachen Ihrer Eltern? (Elternteil 1 / Elternteil 2)",
      helex_proficiency_title:
        "Bitte bewerten Sie, wie gut Sie die jeweilige Sprache sprechen, verstehen, lesen und schreiben können.",
      helex_questions: [
        "Wie gut verstehen Sie diese Sprache?",
        "Wie gut sprechen Sie diese Sprache?",
        "Wie gut lesen Sie in dieser Sprache?",
        "Wie gut schreiben Sie in dieser Sprache?",
      ],
      helex_options: [
        "Fast gar nicht",
        "Nicht so gut",
        "Ziemlich gut",
        "Sehr gut",
        "Nicht zutreffend",
      ],
      frequency_title:
        "Bitte bewerten Sie für alle von Ihnen verwendeten Sprachen, wie oft Sie diese nutzen.",
      frequency_questions: [
        "Wie oft hören Sie diese Sprache?",
        "Wie oft sprechen Sie diese Sprache?",
        "Wie oft lesen Sie in dieser Sprache?",
        "Wie oft schreiben Sie in dieser Sprache?",
      ],
      frequency_options: [
        "(fast) nie",
        "mehrmals im Jahr",
        "einmal im Monat",
        "einmal pro Woche",
        "mehrmals pro Woche",
        "einmal am Tag (fast täglich)",
        "mehrmals am Tag (fast täglich)",
      ],
      identity_statement:
        "Wenn ich Türkisch spreche, fühle ich mich ganz ich selbst.",
      identity_options: [
        "Stimme überhaupt nicht zu",
        "Stimme größtenteils nicht zu",
        "Stimme eher nicht zu",
        "Weder noch",
        "Stimme eher zu",
        "Stimme im Allgemeinen zu",
        "Stimme voll und ganz zu",
        "Keine Angabe",
      ],
      travel_title:
        "Bitte geben Sie die Häufigkeit und Dauer Ihrer Reisen in die Türkei an.",
      visit_count_title: "Wie oft reisen Sie pro Jahr in die Türkei?",
      visit_count_options: [
        "Nie",
        "Nicht jedes Jahr",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ],
      visit_duration_title:
        "Wie viel Zeit verbringen Sie bei einem Besuch in der Türkei durchschnittlich?",
      visit_duration_options: [
        "Ich besuche sie nicht",
        "2–3 Tage",
        "Eine Woche",
        "2 Wochen",
        "3 Wochen",
        "Ein Monat",
        "Anderthalb Monate",
        "Zwei Monate",
        "3 Monate",
        "4 Monate",
        "Mehr als 4 Monate",
      ],
    },
    messages: {
      completion:
        "Sie haben diesen Teil abgeschlossen. Vielen Dank für Ihre Teilnahme! Ihre Antworten wurden gespeichert.",
    },
  },
};
