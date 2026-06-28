import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "../../context/UserContext";

interface ChildLite { uid: string; name: string; examGroupId?: string | null; }

/** Resolves the linked child accounts for a parent user and tracks the currently selected one. */
export function useParentChild() {
  const { user } = useUser();
  const [children, setChildren] = useState<ChildLite[]>([]);
  const [childId, setChildId] = useState<string | null>(null);

  useEffect(() => {
    const ids = user?.linkedStudentIds || [];
    if (ids.length === 0) { setChildren([]); return; }
    Promise.all(ids.map((id) => getDoc(doc(db, "users", id)))).then((docs) => {
      const list = docs.filter((d) => d.exists()).map((d) => ({ uid: d.id, name: (d.data() as any).name || "Student", examGroupId: (d.data() as any).examGroupId }));
      setChildren(list);
      if (list[0]) setChildId(list[0].uid);
    });
  }, [user?.linkedStudentIds]);

  const child = children.find((c) => c.uid === childId) || null;
  return { children, childId, child, setChildId };
}
