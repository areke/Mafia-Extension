n, k = map(int, raw_input().split(" "))
a, b, c, d = map(int, raw_input().split(" "))
if n < 5 or k < n+1:
	print -1
else:
	ans1 = []
	ans2 = []
	lst = []
	s = [a,b,c,d]
	for i in range(1, n+1):
		if i not in s:
			lst.append(i)
	if len(lst) <= 2:
		e = lst[0]
		ans1 += [a,c,e,d,b]
		ans2 += [c,a,e,b,d]
	print (' '.join(map(str, ans1)))
	print (' '.join(map(str, ans2)))